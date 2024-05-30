import {default as fetch, Response } from 'node-fetch';
import { SbdSplitter } from 'sbd-splitter';
import FormData from 'form-data';
import TurndownService from 'turndown'
var turndownService = new TurndownService({headingStyle: 'atx'})




export class ParserService {
  constructor(options) {
    this.options = options
    
  }

  async create(data, params) {

    // assume data is a readStream
    let output = await this.uploadFileToNLM(data, params)
    let html = this.createHTMLfromNLM(output)
    let markdown = turndownService.turndown(html)

    if(params.format === 'html'){
      return html
    }else if(params.format === 'markdown'){
      return markdown
    }else if(params.format === 'chunks'){
      const splitter = new SbdSplitter({...this.options.splitter, ...params.splitter});
      return splitter.split(markdown)
    }
    
  }

  async uploadFileToNLM(readStream, options){
    options = {...this.options, ...options} // allow overrides from local calls
    const form = new FormData();
    form.append('file', readStream);

    let url = new URL(options.path); //'http://localhost:5001/api/parseDocument'
    url.searchParams.append('renderFormat', options.renderFormat);
    url.searchParams.append('applyOcr', options.applyOcr);

    const headers = {
        'accept': 'application/json',
        'Content-Type': 'multipart/form-data',
        ...form.getHeaders()
    };
  
    try {
      const response = await fetch(url.toString(), {
          method: 'POST',
          headers: headers,
          body: form
      });
      return response.data;
    } catch (error) {
        console.error(error);
    }
  };

  createHTMLfromNLM(json) {
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
  

}

export const getOptions = (app) => {
  return {
    app,
    path: app.get('parser')?.nlm?.host + '/api/parseDocument',
    applyOcr: app.get('parser')?.nlm?.applyOcr || 'yes',
    renderFormat: app.get('parser')?.nlm?.renderFormat || 'all',
    splitter:{
      chunkSize: app.get('parser')?.nlm?.splitter?.chunkSize || 10000,
      chunkSize: app.get('parser')?.nlm?.splitter?.softChunkSize || 3000,
    }
  }
}



