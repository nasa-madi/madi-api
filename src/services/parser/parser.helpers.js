import {default as fetch } from 'node-fetch';
import FormData from 'form-data';
import { Readable } from 'stream'


export const uploadFileToNLM = async (file, options)=> {
  const form = new FormData();
  let readStream;

  // Convert buffer to readable stream if necessary
  if (file && file.buffer && Buffer.isBuffer(file.buffer)) {
    readStream = bufferToStream(file.buffer);
  }

  if(!readStream){
    throw new Error('File not found')
  }


  form.append('file', readStream, {
    filename: file.originalname, 
    contentType: 'application/pdf'
  });

  let url = new URL(options.path);
  if(options.renderFormat) url.searchParams.append('renderFormat', options.renderFormat);
  if(options.applyOcr) url.searchParams.append('applyOcr', options.applyOcr);

  const headers = {
      'accept': 'application/json',
      ...form.getHeaders()
  };

  try {
    console.log('FormData contents:', form); // Debugging line
    const response = await fetch(url.toString(), {
        method: 'POST',
        headers: headers,
        body: form,
        redirect: "follow"
    });
    const data = await response.json(); // Parse the response as JSON
    console.log('Response:', data); // Debugging line
    return data
  } catch (error) {
      console.error(error);
  }
};

export function createHTMLfromNLM(json) {
    const blocks = json.return_dict.result.blocks;
    let html = '';
  
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
            let content = block.sentences ? block.sentences.map(replaceUnicodeFFFD).join(' ') : '';
            html += `<${tag} class="${block.block_class}">${content}</${tag}>\n`;
  
            if (block.children && block.children.length > 0) {
                html += createHTMLfromNLM({ return_dict: { result: { blocks: block.children } } });
            }
        }
    });
  
    return html;
  }
  
  
  export function bufferToStream(buffer) {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }
  
  
  export function replaceUnicodeFFFD(str) {
    if (typeof str !== 'string') {
        console.log(typeof String)
        console.log(str)
        return str;
    }
    return str.replace(/\ufffd/g, ' ');
  }