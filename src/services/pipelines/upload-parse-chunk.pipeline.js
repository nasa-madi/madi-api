import pick from 'lodash/pick.js'
import omit from 'lodash/omit.js'

export const UploadParseChunkPipeline = async function (data, params) {
    let uploadResult = await this.app.service('uploads').create(data, params).catch(err => {
        console.log('upload error', err)
        if (err.name === 'Conflict') {
            return this.app.service('uploads').get(encodeURIComponent(err.data.filePath), params)
        } else {
            throw err
        }
    })
    console.log('uploadResult', uploadResult)

    let parseResult = await this.app.service('parser').create({}, params)
    console.log('parseResult', parseResult)

    let metadataResult = await this.app.service('chats').create({
        messages: [
            { role: "system", content: "You are a document parsing engine for a search solution. You must parse the given text into the appropriate fields.  It is critical that you do not guess on fields.  Approximations for dates are acceptable.  If you do not know or the document does not specify, leave the field blank. The user will provide the text below" },
            {
                role: "user", content: `\n
CONTENT TO EXTRACT METADATA FROM:\n
---------------------------------\n
\`\`\`
${parseResult}
---------------------------------\n
\`\`\``
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
        content: parseResult,
        uploadPath: uploadResult.filePath
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
                    description: "A brief summary of the document."
                }
            },
            required: ["metadata"]
        }
    }
};