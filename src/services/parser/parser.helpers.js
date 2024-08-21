import { default as fetch } from 'node-fetch';
import FormData from 'form-data';
import { Readable } from 'stream';
import { Buffer } from 'buffer';
import { logger } from '../../logger.js';
import { GoogleAuth } from 'google-auth-library';


// Function to obtain the identity token
async function getGoogleIdentityToken(targetAudience) {
    const auth = new GoogleAuth();
    const client = await auth.getIdTokenClient(targetAudience);
    const response = await client.request({ url: targetAudience });
    const idToken = response?.config?.headers?.Authorization
    if (!idToken) {
        throw new Error('Failed to obtain ID token', { cause: response });
    }
    return idToken;
}

// Function to upload a file to NLM service
export const uploadFileToNLM = async (file, options) => {
    const form = new FormData();
    let readStream;


    // Convert buffer to a readable stream if the file is provided as a buffer
    if (file && file.buffer && Buffer.isBuffer(file.buffer)) {
        readStream = bufferToStream(file.buffer);
    }

    // If the readable stream could not be created, throw an error
    if (!readStream) {
        const errorMsg = 'File not found';
        logger.error(errorMsg);
        throw new Error(errorMsg);
    }

    // Append the file to the form data
    form.append('file', readStream, {
        filename: file.originalname, 
        contentType: file.mimetype
    });

    // Construct the URL with optional query parameters
    let url = new URL(options.path);
    console.log('og url', url.toString())
    if (options.renderFormat) url.searchParams.append('renderFormat', options.renderFormat);
    if (options.applyOcr) url.searchParams.append('applyOcr', options.applyOcr);


    let identityHeaders = {}
    if (options.identityProvider === 'google'){
        // Get the identity token
        // let token = await getAccessToken(); // Call the function to get the access token
        
        const basePath = new URL(url).origin; // Extract the base path
        console.log('basePath', url.origin)
        const token = await getGoogleIdentityToken(basePath);
        identityHeaders = {
            'Authorization': token,
        }
    }
    

    // Set up the headers, including form-specific headers
    const headers = {
        'accept': 'application/json',
        ...identityHeaders,
        ...form.getHeaders()
    };

    try {
        // Send the POST request to the NLM service
        console.log('url', url.toString())
        console.log('headers', headers)
        const response = await fetch(url.toString(), {
            method: 'POST',
            headers: headers,
            body: form,
            redirect: "follow"
        });

        console.log('response', response)
        // Parse the response as JSON
        const data = await response.json();

        // Truncate the parsed document for logging
        const truncatedData = JSON.stringify(data).substring(0, 100) + '...';
        logger.info('Parsed document response received: ' + truncatedData); // Logging the truncated response for debugging
        
        return data;
    } catch (error) {
        console.log('error', error)
        logger.error('Error during file upload to NLM', { error }); // Log the error with context
        throw error;
    }
};

// Function to convert NLM JSON response to HTML
export function createHTMLfromNLM(json) {
    const blocks = json.return_dict.result.blocks;
    let html = '';

    // Loop through each block and convert to corresponding HTML tags
    blocks.forEach(block => {
        let tag;
        switch (block.tag) {
            case 'header':
                tag = 'h1';
                break;
            case 'para':
                tag = 'p';
                break;
            case 'list_item':
                tag = 'li';
                break;
            case 'table':
                tag = 'table';
                break;
            case 'table_row':
                tag = 'tr';
                break;
            case 'table_cell':
                tag = 'td';
                break;
            default:
                tag = 'div';
        }

        // Handle table-specific blocks
        if (block.tag === 'table') {
            html += `<${tag} class="${block.block_class}">\n`;
            if (block.table_rows) {
                block.table_rows.forEach(row => {
                    html += `<tr class="${row.block_class}">\n`;
                    if (row.cells) {
                        row.cells.forEach(cell => {
                            if (typeof cell.cell_value === 'string') {
                                html += `<td>${replaceUnicodeFFFD(cell.cell_value)}</td>\n`;
                            } else {
                                html += `<td>${createHTMLfromNLM({ return_dict: { result: { blocks: [cell.cell_value] } } })}</td>\n`;
                            }
                        });
                    }
                    html += `</tr>\n`;
                });
            }
            html += `</${tag}>\n`;
        } else {
            // Handle non-table blocks
            let content = block.sentences ? block.sentences.map(replaceUnicodeFFFD).join(' ') : '';
            html += `<${tag} class="${block.block_class}">${content}</${tag}>\n`;

            // Recursively handle child blocks
            if (block.children && block.children.length > 0) {
                html += createHTMLfromNLM({ return_dict: { result: { blocks: block.children } } });
            }
        }
    });

    return html;
}

// Helper function to convert a buffer into a readable stream
export function bufferToStream(buffer) {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null); // End the stream
    return stream;
}

// Function to replace Unicode replacement characters (�) with a space
export function replaceUnicodeFFFD(str) {
    if (typeof str !== 'string') {
        logger.warn('Input is not a string, returning as-is', { input: str }); // Log a warning if the input isn't a string
        return str;
    }
    return str.replace(/\ufffd/g, ' ');
}