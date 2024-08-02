import _ from 'lodash'
import * as openaiAdapter from './adapters/adapter.openai.js'
import * as ollamaAdapter from './adapters/adapter.ollama.js'


function mapFamilyToAdapter(family){
  switch(family){
    // case 'gemini':
    //   return geminiAdapter
    case 'llama':
      return ollamaAdapter
    case 'gpt':
      return openaiAdapter
    default:
      return openaiAdapter
  }
}


export class ChatService {
  constructor(options) {
    this.options = options
  }

  async create(data, params) {
    console.log('\n\n************ CHAT SERVICE CREATE')
    let { messages, tools, tool_choice } = data
    let stream = !!data.stream
    let options = {
      stream:false,
      messages, 
      tools: (tools)?tools.map(t=>_.omit(t,['plugin','display'])):undefined, 
      tool_choice: (tools)?tool_choice:undefined
    }

    let Adapter = mapFamilyToAdapter(params.family)
    let adapter = new Adapter(app)
    return adapter.makeRequest(options)
  }
}




export const getOptions = (app) => {
  return { app }
}
