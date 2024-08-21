import pick from 'lodash/pick.js';
import omit from 'lodash/omit.js';
import isEqual from 'lodash/isEqual.js';
import path from 'path';
import { Buffer } from 'buffer';
import { subject } from '@casl/ability';
import { BadRequest, Forbidden } from '@feathersjs/errors';
import { logger } from '../../logger.js';

const LOGKEY = 'PIPELINE: UPLOAD-PARSE-CHUNK: ';

// Main pipeline function to handle the upload, parsing, and processing of documents
export const UploadParseChunkPipeline = async function (data, params) {
    // Retrieve pipeline-specific configurations from the app or params
    const config = this.app.get('pipelines')?.[params?.pipelineId] || {};

    // Set contentLimit from the config or query parameters, with a default value
    const contentLimit = config.contentLimit || params?.query?.contentLimit || 30000;

    // Determine the plugin to be used for processing, with 'Core' as the default
    if (!params?.query?.plugin) {
        logger.error('Plugin not specified in query parameters');
        throw new BadRequest('A specific name, e.g. "search_books", or "all" must be set as the "plugin" query parameter.');
    }

    if (params?.query?.plugin !== 'all') {
        // TODO: check if the plugin exists
        logger.warn(LOGKEY+'Specific plugin provided, but existence check is not yet implemented');
    }

    // Set the plugin and restriction flags in params for later use
    params.plugin = params?.query?.plugin;
    params.restrictToPlugin = ['true', 'yes', 1, '1', true].includes(params?.query?.restrictToPlugin) || false;
    params.restrictToUser = ['true', 'yes', 1, '1', true].includes(params?.query?.restrictToUser) || false;

    // Prepare strings for user and plugin restriction checks
    const pluginString = params.restrictToPlugin ? params.plugin : 'all';
    const userString = params.restrictToUser ? params?.user?.id || 'all' : 'all';

    // Check if the user has the ability to upload based on the restrictions
    if (!params.ability.can('upload-parse-chunk', subject('pipelines', {
        pluginString,
        userString
    }))) {
        logger.error('User is not authorized to upload to this location');
        throw new Forbidden('You are not authorized to upload to this location.');
    }

    // Set character limits for different sections of the document
    const metaCharCount = config.metaCharCount || params?.query?.metaCharCount || 20000;

    // Step 1: Upload the document
    // The uploadDocument function handles the actual file upload and conflict checks
    let upload;
    try {
        upload = await uploadDocument(this.app, { ...data }, params);
        logger.info(LOGKEY+'Document uploaded successfully', { filePath: upload.filePath });
    } catch (err) {
        logger.error('Document upload failed', err);
        throw err;
    }

    // Step 2: Check if the document has already been processed (exists in the database)
    let document;
    try {
        document = await findExistingDocument(this.app, upload.filePath, params) || {};
        if (document.id) {
            logger.info(LOGKEY+'Existing document found', { documentId: document.id });
        } else {
            logger.info(LOGKEY+'No existing document found, proceeding with parsing');
        }
    } catch (err) {
        logger.error('Error while checking for existing document', err);
        throw err;
    }

    // Step 3: Parse the document if it hasn't been processed before
    let parseMarkdown;
    if (!document?.content && !document?.parsedPath) {
        try {

            // check if parsed Document exists


            // If the document hasn't been parsed, start the parsing process
            const parseJson = await parseDocument(this.app, upload, params);

            // Check if parsing was successful
            if (parseJson.status !== 200) {
                logger.error('Parsing failed', { status: parseJson.status });
                throw new Error('Parsing failed');
            }

            // Convert the parsed JSON result to a string for storage or further processing
            let parseJsonString = JSON.stringify(parseJson);

            // Convert the parsed content to Markdown format
            parseMarkdown = await this.app.service('parser').convert(parseJson, { query: { format: "markdown" } });

            // If the parsed content exceeds the content limit, upload the parsed content
            if (parseMarkdown.length > contentLimit) {
                logger.info(LOGKEY+'Parsed content exceeds limit, uploading parsed content');
                const uploadedParse = await uploadParsedDocument(this.app, upload, params, parseJsonString);
                document = { ...document, parsedPath: uploadedParse.filePath };

                // Include full content for chunking
                params.rawContent = parseMarkdown;
            } else {
                // If the content is within the limit, store it directly in the document
                logger.info(LOGKEY+'Parsed content within limit, storing directly in document');
                document = { ...document, content: parseMarkdown };
            }
        } catch (err) {
            logger.error('Error during document parsing', err);
            throw err;
        }
    }

    // Step 4: Save or update the document in the database
    if (document.id) {
        // Update the existing document if it already exists

        const updatedFields = pick(document, ['parsedPath', 'uploadPath', 'content']);
        const existingDocument = await this.app.service('documents').get(document.id);

        // Check if the document's content has changed
        if (!isEqual(pick(existingDocument, ['parsedPath', 'uploadPath', 'content']), updatedFields)) {
            logger.info(LOGKEY+'Document content has changed, updating document', { documentId: document.id });
            return await this.app.service('documents').patch(document.id, updatedFields, omit(params, ['query']));
        } else {
            logger.info(LOGKEY+'No changes detected, returning existing document', { documentId: existingDocument.id });
            return existingDocument;
        }
    } else {
        // Create a new document if it doesn't exist
        const metadataResult = await extractMetadata(this.app, document.content || parseMarkdown, params, metaCharCount);
        const newDocument = buildNewDocument(metadataResult, upload, document.content, document.parsedPath, params.plugin);
        logger.info(LOGKEY+'Creating a new document', { plugin: params.plugin });
        return await this.app.service('documents').create(newDocument, omit(params, ['query']));
    }
};

// Function to upload a document
async function uploadDocument(app, data, params) {
    const uploadQueryFields = ['sign']; // Relevant query fields for uploads
    try {
        // Attempt to upload the document with specific query parameters
        const result = await app.service('uploads').create(data, {
            ...params,
            query: pick(params?.query || {}, uploadQueryFields)
        });
        logger.info(LOGKEY+'Document upload successful', { filePath: result.filePath });
        return result;
    } catch (err) {
        if (err.name === 'Conflict') {
            // If a conflict occurs (document already exists), retrieve the existing document
            logger.info(LOGKEY+'Document conflict detected, retrieving existing document', { filePath: err.data.filePath });
            return app.service('uploads').get(encodeURIComponent(err.data.filePath), params);
        } else {
            // Throw any other errors
            logger.error('Document upload failed with error', err);
            throw err;
        }
    }
}

// Function to check for existing documents in the database
async function findExistingDocument(app, filePath, params) {
    try {
        // Search for documents in the database with the same upload path
        const result = await app.service('documents').find({
            ...params,
            query: {
                uploadPath: filePath,
                $limit: 1 // We only need the first match
            }
        });
        // Return the existing document (if any)
        return result.data[0];
    } catch (err) {
        logger.error('Error during document lookup', err);
        throw new Error(err);
    }
}

// Function to parse the document
async function parseDocument(app, document, params) {
    const config = app.get('pipelines')?.[params?.pipelineId] || {};

    // Determine if OCR should be applied during parsing
    const applyOcr = config.defaultApplyOcr || params?.query?.applyOcr || 'no';
    params.query = { ...params.query, applyOcr };

    const parserQueryFields = ['applyOcr']; // Only relevant query fields for parsing
    try {
        // Send the document to the parser service
        const parseResult = await app.service('parser').create({}, {
            ...params,
            query: pick(params?.query || {}, parserQueryFields)
        });
        logger.info(LOGKEY+'Document parsed successfully');
        return parseResult;
    } catch (err) {
        logger.error('Error during document parsing', err);
        throw err;
    }
}

// Function to upload parsed content
async function uploadParsedDocument(app, upload, params, parseResult) {
    const parseBuffer = Buffer.from(parseResult, 'utf-8'); // Convert the parsed result to a buffer
    try {
        // Attempt to upload the parsed content as a new document
        const result = await app.service('uploads').create({
            originalFilePath: upload.filePath // The original file's path
        }, {
            ...params,
            file: {
                buffer: parseBuffer,
                filePrefix: upload.metadata.systemMetadata.filePrefix, // Use filePrefix from system metadata
                pathPrefix: upload.metadata.systemMetadata.pathPrefix, // Use pathPrefix from system metadata
                originalname: `${path.basename(upload.filePath, path.extname(upload.filePath))}-parsed.json`,
                mimetype: 'application/json' // The parsed content is JSON formatted
            },
            query: {
                sign: true // Sign the upload request
            }
        });
        logger.info(LOGKEY+'Parsed document uploaded successfully', { filePath: result.filePath });
        return result;
    } catch (err) {
        if (err.name === 'Conflict') {
            // Handle document conflicts
            logger.info(LOGKEY+'Conflict detected during parsed document upload', { filePath: err.data.filePath });
            return app.service('uploads').get(encodeURIComponent(err.data.filePath), params);
        } else {
            // Throw any other errors
            logger.error('Parsed document upload failed', err);
            throw err;
        }
    }
}
    
// Function to extract metadata using the chat service
async function extractMetadata(app, parseResult = '', params, metaCharCount) {
    try {
        logger.debug('Extracting metadata from document');
        let parseSlice = parseResult.slice(0, metaCharCount);

        const metadataResult = await app.service('chats').create({
            messages: [
                { role: "system", content: "You are a document parsing engine for a search solution..." },
                { role: "user", content: parseSlice }
            ],
            tools: [instructions],
            tool_choice: { "type": "function", "function": { "name": 'generate_document_metadata' } }
        }, omit(params, ['query']));

        return JSON.parse(metadataResult?.choices[0]?.message?.tool_calls[0]?.function?.arguments || '{}');
    } catch (e) {
        logger.error('Metadata parsing error:', e);
        return {};
    }
}

// Function to build the final document object
function buildNewDocument(metadata, upload, content = null, parsedPath = null, plugin) {
    logger.debug('Building new document object');
    return {
        ...metadata,
        metadata: {
            systemMetadata: upload?.metadata?.systemMetadata || {},
            ...metadata?.metadata,
            ...upload?.metadata?.sourceMetadata
        },
        content,
        parsedPath,
        plugin,
        uploadPath: upload.filePath
    };
}


export const instructions = {
    type: 'function',
    plugin: 'Core',
    display: 'Generate Document Metadata',
    function: {
        name: "generate_document_metadata",
        description: "Extract metadata, content, and related information from a text source.",
        parameters: {
            type: "object",
            properties: {
                metadata: {
                    type: "object",
                    description: "Metadata information extracted from the document.",
                    properties: {
                        authors: {
                            type: "array",
                            description: "List of authors who contributed to the document.",
                            items: {
                                type: "string"
                            }
                        },
                        title: {
                            type: "string",
                            description: "Title of the document."
                        },
                        publicationDate: {
                            type: "string",
                            format: "date",
                            description: "Date when the document was published."
                        },
                        publisher: {
                            type: "string",
                            description: "Publisher of the document."
                        },
                        journal: {
                            type: "string",
                            description: "Name of the journal where the document was published, if applicable."
                        },
                        volume: {
                            type: "string",
                            description: "Volume number of the journal."
                        },
                        issue: {
                            type: "string",
                            description: "Issue number of the journal."
                        },
                        pages: {
                            type: "string",
                            description: "Page range where the document appears in the journal."
                        },
                        url: {
                            type: "string",
                            format: "uri",
                            description: "URL where the document can be accessed."
                        },
                        doi: {
                            type: "string",
                            description: "Digital Object Identifier (DOI) of the document."
                        },
                        isbn: {
                            type: "string",
                            description: "International Standard Book Number (ISBN) of the document."
                        },
                        issn: {
                            type: "string",
                            description: "International Standard Serial Number (ISSN) of the journal."
                        },
                        keywords: {
                            type: "array",
                            description: "List of keywords associated with the document.",
                            items: {
                                type: "string"
                            }
                        },
                        references: {
                            type: "array",
                            description: "List of references cited in the document.",
                            items: {
                                type: "string"
                            }
                        },
                        isPeerReviewed: {
                            type: "boolean",
                            description: "Indicates whether the document was peer-reviewed."
                        },
                        affiliation: {
                            type: "string",
                            description: "Affiliation of the authors, typically their institution or organization."
                        },
                        sourceDomain: {
                            type: "string",
                            description: "Domain of the source website from where the document was accessed."
                        },
                        headerImage: {
                            type: "string",
                            format: "uri",
                            description: "URL of the header image associated with the document."
                        },
                        images: {
                            type: "array",
                            description: "List of URLs of images included in the document.",
                            items: {
                                type: "string",
                                format: "uri"
                            }
                        },
                        type: {
                            type: "string",
                            description: "Type or category of the document (e.g., Article, Report, etc.)."
                        },
                        urlHash: {
                            type: "string",
                            description: "Hash of the document's URL, used for tracking or identifying the document."
                        },
                        accessDate: {
                            type: "string",
                            format: "date",
                            description: "Date when the document was last accessed."
                        },
                        isArchived: {
                            type: "boolean",
                            description: "Indicates whether the document has been archived."
                        },
                        archivedUrl: {
                            type: "string",
                            format: "uri",
                            description: "URL of the archived version of the document."
                        }
                    },
                    required: []
                },
                abstract: {
                    type: "string",
                    description: "A concise abstract based on the provided [pages/section] of the [document/article/research paper]. This field should summarize the main objectives, key findings or arguments introduced so far, and any methodologies mentioned. Ensure that the abstract is informative, focusing on the content given, and highlight the significance of the work if indicated. Limit the summary to 150-250 words."
                }
            },
            required: ["metadata"]
        }
    }
};