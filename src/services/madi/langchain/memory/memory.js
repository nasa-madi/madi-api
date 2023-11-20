import { ChatOpenAI } from "langchain/chat_models/openai";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { BufferMemory } from "langchain/memory"
import { ChatMessageHistory } from "langchain/memory";
import { Debug } from '../utils/logger.js'


const debug = Debug(import.meta.url)


/**
 * @typedef {import("../types.js").Metadata} Metadata 
 * @typedef {import("../types.js").ServerResponse} ServerResponse
 */



/**
 * @param {array} memoryArray
 * @returns {object} - This should be a ChatHistory Object
 */
export function establishMemory(memoryArray){

    if(!Array.isArray(memoryArray)) throw new Error('memoryArray must remain an array');

    let memory = new BufferMemory({
        chatHistory: new ChatMessageHistory(memoryArray),
        memoryKey:'chat_history',
        returnMessages: true,
    })
    // memory.saveContext = async function (inputValues, outputValues){
    //     // this is purposefully done in sequence so they're saved in order
    //     debug("using the new memory.saveContext")
    //     await this.chatHistory.addUserMessage(getInputValue(inputValues, this.inputKey));
    //     let output = getInputValue(outputValues, this.outputKey)
    //     // this allows for a tuple output attached to the memory
    //     if(Array.isArray(output) && typeof output[0] === 'string' && typeof output[1] === 'object'){
    //         let message = new AIChatMessage(output[0])
    //         message.metadata = output[1]
    //         this.chatHistory.addMessage(message);
    //     }else{
    //         await this.chatHistory.addAIChatMessage(output[0]);

    //     }
    // }

    // For LLMs, not chatbots
    memory.saveContext = async function ({message}, {output}){
        // this is purposefully done in sequence so they're saved in order
        debug("using the new memory.saveContext")
        await this.chatHistory.addUserMessage(message);
        await this.chatHistory.addAIChatMessage(typeof output === 'string'? output : output[0]);

        // let message = new AIChatMessage(output[0])
        // // this allows for a tuple output attached to the memory
        // if(Array.isArray(output) && typeof output[0] === 'string' && typeof output[1] === 'object'){
        //     let message = new AIChatMessage(output[0])
        //     message.metadata = output[1]
        //     this.chatHistory.addMessage(message);
        // }else{
        //     await this.chatHistory.addAIChatMessage(output[0]);

        // }
    }
    return memory
}
