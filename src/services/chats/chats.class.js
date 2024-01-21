import _ from 'lodash'

export class ChatService {
  constructor(options) {
    this.options = options
  }

  async makeRequest(options){
    let openai = this.options?.app?.openai
    return openai.chat.completions.create(options);
  }
  

  async create(data, params) {
    console.log('\n\n************ CHAT SERVICE CREATE')
    // console.log("tools: ", availableToolDescriptions)
    let { messages, tools, tool_choice } = data
    let stream = !!data.stream
    let options = {
      model: 'gpt-4-1106-preview',
      // stream: params?.query?.stream === 'false' ? false:true,
      stream,
      messages, 
      tools: (tools)?tools.map(t=>_.omit(t,['plugin','display'])):undefined, 
      tool_choice: (tools)?tool_choice:undefined
    }
    // return data
    return this.makeRequest(options)
  }
}

export const getOptions = (app) => {
  return { app }
}
