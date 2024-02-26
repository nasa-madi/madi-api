import _ from 'lodash'
import * as openaiAdapter from './chats.openai.js'
import * as geminiAdapter from './chats.gemini.js'


export class ChatService {
  constructor(options) {
    this.options = options
  }

  async create(data, params) {
    console.log('\n\n************ CHAT SERVICE CREATE')
    // console.log("tools: ", availableToolDescriptions)
    let { messages, tools, tool_choice } = data
    let stream = !!data.stream
    let options = {
      stream,
      messages, 
      tools: (tools)?tools.map(t=>_.omit(t,['plugin','display'])):undefined, 
      tool_choice: (tools)?tool_choice:undefined
    }
    if(data.model === 'gemini-pro'){
      return geminiAdapter.makeRequest(
        options, // params
        this.options.app.gemini,  // shared instance
        this.options.app.get('gemini').key // API KEY
      )
    }
    return openaiAdapter.makeRequest(
      options, // params
      this.options.app.openai,  // shared instance
      this.options.app.get('openai').key // API KEY
    )
  }
}

export const getOptions = (app) => {
  return { app }
}
