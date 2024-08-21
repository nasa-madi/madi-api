import { SbdSplitter } from 'sbd-splitter';
import TurndownService from 'turndown'
import { createHTMLfromNLM, uploadFileToNLM } from './parser.helpers.js'



export class ParserService {
  constructor(options) {
    this.options = options
    this.turndownService = new TurndownService({headingStyle: 'atx'})
  }

  async create(data, params) {
    let options = {...this.options, applyOcr: params?.query?.applyOcr}
    let json
    if(params.file){
      json = await uploadFileToNLM(params.file, options)
    }else{
      json = data
    }
    return this.convert(json, params)
  }

  convert(data, params) {
    const splitter = new SbdSplitter({...this.options.splitter, ...params.splitter});
    switch(params?.query?.format){
      case 'html':
        return createHTMLfromNLM(data)
      case 'markdown':
        return this.turndownService.turndown(createHTMLfromNLM(data))
      case 'chunks':
        return splitter.splitText(this.turndownService.turndown(createHTMLfromNLM(data)))
      default:
        return data
    }
  }

}



export const getOptions = (app) => {
  return {
    app,
    path: app.get('parser')?.nlm?.host + '/api/parseDocument',
    applyOcr: app.get('parser')?.nlm?.applyOcr || 'no',
    renderFormat: app.get('parser')?.nlm?.renderFormat || 'all',
    identityProvider: app.get('parser')?.nlm?.identityProvider || 'none',
    splitter:{
      chunkSize: app.get('parser')?.nlm?.splitter?.chunkSize || 10000,
      softMaxChunkSize: app.get('parser')?.nlm?.splitter?.softMaxChunkSize || 3000,
      delimiters: app.get('parser')?.nlm?.splitter?.delimiters || [
          '\n# ',
          '\n## ',
          '\n### ',
          '\n#### ',
          '\n##### ',
          '\n###### ',
          '```\n\n',
          '\n\n***\n\n',
          '\n\n---\n\n',
          '\n\n___\n\n',
          '\n\n',
          '\n',
          '&#&#&#',
          ' ',
          ''
      ]
    }
  }
}

