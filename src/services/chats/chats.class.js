import _ from 'lodash'

export class ChatService {
  constructor(options) {
    this.options = options
  }

  async makeRequest(options) {
    options.model = 'gpt-4-1106-preview';
    let openai = this.options?.app?.openai;
    try {
      let response = await openai.chat.completions.create(options)
      return response
    } catch (error) {
      console.log('Request:', options, 'Error:', error);
      throw error;
    }
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
    // return data
    return this.makeRequest(options)
  }
}

export const getOptions = (app) => {
  return { app }
}
