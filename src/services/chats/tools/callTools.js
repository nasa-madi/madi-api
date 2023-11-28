  import { availableTools } from "./availableTools.js";
  import openai from "../cacheProxy.js";
  import * as dotenv from 'dotenv'
  dotenv.config()
  
  
  export async function callTools(messages=[], response){
    
    const responseMessage = response?.choices[0]?.message;
    
    // update the messages to include the assistants reply
    let newMessages = [responseMessage]

    // if the model DOES want to call tools, do so
    if (responseMessage.tool_calls) {    
        // console.log('in tool calls',responseMessage.tool_calls)
        // for each toolCall, run the tool
        for (const toolCall of responseMessage.tool_calls) {
            const functionName = toolCall.function.name;
            const functionToCall = availableTools[functionName];
            const functionArgs = JSON.parse(toolCall.function.arguments);
            const functionResponse = functionToCall(functionArgs);
            
            // update the messages to include the tool calls
            newMessages.push({
                tool_call_id: toolCall.id,
                role: "tool",
                name: functionName,
                content: functionResponse,
            }); 
        }
        
        // with the extended conversation and tool responses, get a new response.
        const secondResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-1106",
            messages: [...messages, ...newMessages],
        }).catch(e=>{
            console.log('Second Response Error',e)
        })
    
        return secondResponse;
    }
    else {
        
        return response
    }
  }
