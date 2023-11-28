import { availableToolDescriptions } from './tools/availableTools.js';
import { callTools } from './tools/callTools.js';
import openai from "./cacheProxy.js";


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

    const response = await openai.chat.completions.create({
      model: data.model || "gpt-4-1106-preview",
      messages: data.messages || [
        {role:"user", content:"Hello what can you do?"}
      ],
      tool_choice: data.tool_choice || "auto",
      tools: [{
        type: "function",
        function: {
          name: "get_current_weather",
          description: "Get the current weather in a given location",
          parameters: {
            type: "object",
            properties: {
              location: {
                type: "string",
                description: "The city and state, e.g. San Francisco, CA",
              },
              unit: { type: "string", enum: ["celsius", "fahrenheit"] },
            },
            required: ["location"],
          },
        },
      }]
    }).catch(e=>{
      console.log(e)
    })
    console.log('\n\n********************')
    // console.log(tools, tool_choice)
    return callTools(data.messages, response);


  }
}

export const getOptions = (app) => {
  return { app }
}
