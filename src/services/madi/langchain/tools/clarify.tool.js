//HUMAN: Useful for asking the user when you think you got stuck or you are not sure what to do next.
// USER: "How can I inject investigations into purple reindeer?"
// AI: HUMAN


import { OpenAI } from "langchain/llms/openai";
import { Tool } from "langchain/tools";
export class ClarifyTool extends Tool {
    name = "clarify";
    description = "useful for asking the user for more information to input into a tool, answer their question, or clarify their request. The final answer should be a question for the human.";

    constructor(options={}){
        super();
        this.name = options.name || this.name
        this.description = options.description || this.description
        this.returnDirect = true
        this.model = options.model || new OpenAI()
    }

    /**
     * 
     * @param {string} input 
     * @returns {Promise<string>}
     */
    async _call(input){
        return input
    }
}


