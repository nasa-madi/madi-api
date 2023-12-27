import getOpenai from "../utils/cacheProxy.js";



// /*******************************
//  * MERGING
//  *******************************/





export class ChatService {
  constructor(options) {
    this.options = options
  }


  

  async create(data, params) {
    console.log('\n\n************ CHAT SERVICE CREATE')
    console.log("model: ", data.model)
    console.log("messages: ",data.messages)
    console.log("tool_choice: ",data.tool_choice || "auto")
    // console.log("tools: ", availableToolDescriptions)
    let { messages, tools, tool_choice } = data
    let options = {
      model: 'gpt-4-1106-preview',
      stream: params?.query?.stream === 'false' ? false:true,
      messages, 
      tools, 
      tool_choice
    }
    // return data
    return makeRequest(options)
    // let writeFunc = (text)=>console.log(text)
    // return await processConversation(messages, tools, tool_choice, writeFunc)
  }
}

export const getOptions = (app) => {

  return { app }
}
