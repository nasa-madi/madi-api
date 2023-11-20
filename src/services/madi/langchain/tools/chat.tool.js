import { Tool } from 'langchain/tools';
import { Debug } from '../utils/logger.js'
import { parseBoolean } from '../utils/boolean.js';
const debug = Debug(import.meta.url)


/**
 * @typedef {import("../types.js").Metadata} Metadata 
 * @typedef {import("../types.js").ServerResponse} ServerResponse
 */

export class ChatTool extends Tool {
    name = "chat";
    description = "useful when responding simply to conversational prompts. Input should never be blank. Input should be appropriate response to user's Question."
    // Input should be the user's most recent question or statement exactly after 'Begin!`. Input should never be blank.";

    constructor(fields){
        super(fields);
        this.name = fields.name || this.name
        this.description = fields.description || this.description
        this.returnDirect = true;
        this.schema = fields.schema || this.schema
        this.verbose = parseBoolean(process.env.VERBOSE) && parseBoolean(process.env.DEBUG)
    }

    /**
     * 
     * @param {string} input 
     * @returns {Promise<string>}
     */
    async _call(input){
        try {
            return input
          } catch (error) {
            return "I don't know how to do that.";
         }
    }
}