import pick from 'lodash/pick.js'
import omit from 'lodash/omit.js'
import { getParsedPath } from '../utils/getParsedPath.js'
import path, { parse } from 'path'
import { Readable } from 'stream';
import FormData from 'form-data';
import authroize from '../utils/authorize.js'

function bufferToStream(buffer) {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null); // Indicates the end of the stream
    return stream;
}


function formatToType(format) {
    switch (format) {
        case 'pdf':
            return { extension: '.pdf', contentType: 'application/pdf' };
        case 'html':
            return { extension: '.html', contentType: 'text/html' };
        case 'xml':
            return { extension: '.xml', contentType: 'application/xml' };
        case 'json':
            return { extension: '.json', contentType: 'application/json' };
        case 'markdown':
            return { extension: '.md', contentType: 'text/markdown' };
        case 'chunks':
            return { extension: '.json', contentType: 'application/json' };
        default:
            return { extension: '.json', contentType: 'application/json' };
    }
}

//determine plugin via user authorization





export const UploadParseChunkPipeline = async function (data, params) {
    let config = this.app.get('pipelines')[params?.pipelineId] || {}

    let contentLimit = config.contentLimit || params?.query?.contentLimit || 1000
    let plugin = config.defaultPlugin || params?.query?.plugin || 'Core'
    let format = config.defaultFormat || params?.query?.format || 'json'
    let applyOcr = config.defaultApplyOcr || params?.query?.applyOcr || false
    let metaCharCount = config.metaCharCount || params?.query?.metaCharCount || 1000
    let contentCharCount = config.contentCharCount || params?.query?.contentCharCount || 1000


    /************ UPLOADING ***************/
    let upload 
    // upload the document to the uploads service
    let uploadQueryFields = ['plugin','sign']
    upload = await this.app.service('uploads').create(data, {...params, query: pick(params?.query||{}, uploadQueryFields) } ).catch(err => {
        if (err.name === 'Conflict') {
            return this.app.service('uploads').get(encodeURIComponent(err.data.filePath), params)
        } else {
            throw err
        }
    })
    let originalName = upload?.metadata?.systemMetadata?.originalName
    let originalNameWithoutExt = path.join(path.dirname(originalName), path.basename(originalName, path.extname(originalName)));
    console.log('uploadResult', upload)
    /***************************************/




    /************ DOC DUPLICATION CHECK ***************/
    // using the filePath, search for the document in the documents service
    let document = await this.app.service('documents').find({
        ...params,
        query: {
            uploadPath: upload.filePath,
            $limit: 1
        }
    }).then(res => res.data[0]).catch(err => {
        throw new Error(err)
    })
    console.log('document', document)
    /***************************************/




    /************ PARSING ***************/
    // if parse fields don't exist
    let parseJSON
    let parserQueryFields = ['applyOcr']
    let parseContent = null
    if(!document?.parsePath || !document.content){
        // parse the document
        // TODO filter out non-parser query params
        parseJSON = await this.app.service('parser').create({}, {...params, query: pick(params?.query||{}, parserQueryFields)})
    }


    // ALLOW CONTENT?
    if(parseJSON.length > contentLimit){
        // Convert parseJSON (UTF-8 text) into a buffer
        const parseBuffer = Buffer.from(parseJSON, 'utf-8');

        // upload the parsed document
        parseUpload = await this.app.service('uploads').create({
            originalFilePath: upload.filePath
        }, {
            ...params,
            query: pick(params?.query||{}, uploadQueryFields),
            file:{
                buffer: parseBuffer,
                filePrefix: upload.metadata.systemMetadata.filePrefix,
                pathPrefix: upload.metadata.systemMetadata.pathPrefix,
                originalname: originalNameWithoutExt + '_parsed.json',
            }
        }).catch(err => {
            if (err.name === 'Conflict') {
                return this.app.service('uploads').get(encodeURIComponent(err.data.filePath), params)
            } else {
                throw err
            }
        })

    }else{
        // GET CONTENT IN CHOSEN FORMAT
        parseContent = await this.app.service('parser').create(parseJSON, 
            {...params, query: pick(params?.query||{}, parserQueryFields)})

    }


    // GET CONTENT
    // if the format is not json, return the parse result
    if(params?.query?.format != 'json'){

    }




    // if the parse result is too long, store in an upload
    if(parseResult.length > contentLimit){
        
    }




    if(document){
        return await this.app.service('documents').patch(document.id, {
            parsedPath: parseUpload.filePath
        }) 
    }

    

    let metadataResult = await this.app.service('chats').create({
        messages: [
            { role: "system", content: "You are a document parsing engine for a search solution. You must parse the given text into the appropriate fields.  It is critical that you do not guess on fields.  Approximations for dates are acceptable.  If you do not know or the document does not specify, leave the field blank. The user will provide the text below.  It is imperative that you only add correct information." },
            {
                role: "user", content: `\nCONTENT TO EXTRACT METADATA FROM:\n---------------------------------\n\`\`\`${parseResult.slice(0, 1000)}\n---------------------------------\n\`\`\``
            }
        ],
        tools: [instructions],
       
        tool_choice: {"type": "function", "function": {"name": 'generate_document_metadata'}} 
    }, omit(params, ['query']))

    let fullChat = {}
    try{
        const stringifiedJson = metadataResult?.choices[0]?.message?.tool_calls[0]?.function?.arguments || '{}'
        fullChat = JSON.parse(stringifiedJson)
    }catch(e){
        console.log('metadata parsing error', e)
    }
    let newDocument = {
        ...fullChat,
        metadata: {
            systemMetadata: uploadResult?.metadata?.systemMetadata || {},
            ...fullChat?.metadata,
            ...uploadResult?.metadata?.sourceMetadata
        },
        content: ,
        parsePath: parseUpload.filePath,
        uploadPath: upload.filePath
    }


    let documentResult = await this.app.service('documents').create(newDocument, omit(params, ['query']))

    return documentResult
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