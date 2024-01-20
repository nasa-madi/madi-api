
export class ChatService {
  constructor(options) {
    this.options = options
  }

  async makeRequest(options){
    let openai = this.options?.app?.openai
    console.log(options)
    return openai.chat.completions.create(options);
  }
  

  async create(data, params) {
    console.log('\n\n************ CHAT SERVICE CREATE')
    console.log(data)
    console.log(params)
    // console.log("model: ", data.model)
    // console.log("messages: ",data.messages)
    // console.log("tool_choice: ",data.tool_choice || "auto")
    // console.log("tools: ", availableToolDescriptions)
    let { messages, tools, tool_choice } = data
    let stream = !!data.stream
    let options = {
      model: 'gpt-4-1106-preview',
      // stream: params?.query?.stream === 'false' ? false:true,
      stream,
      messages, 
      tools, 
      tool_choice
    }
    // return data
    return this.makeRequest(options)
  }
}

export const getOptions = (app) => {
  return { app }
}
