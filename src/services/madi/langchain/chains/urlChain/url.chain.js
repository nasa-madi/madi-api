import { LLMChain } from "langchain/chains";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import * as dotenv from 'dotenv'
import { Debug } from '../../utils/logger.js'
import { BaseOutputParser } from "langchain/schema/output_parser";
import { URL_PROMPT } from "./url.prompt.js"
import { setupRecorder } from "../../utils/nockRecord.js";
import { getIdFromText } from "../../utils/text.js";

const debug = Debug(import.meta.url)
dotenv.config()


/**
 * @typedef {import("../../types.js").Metadata} Metadata 
 * @typedef {import("../../types.js").ServerResponse} ServerResponse
 */



class getUrlOutputParser extends BaseOutputParser{
    parse(input){
        return input.trim()
    }
    getFormatInstructions(){
        return ""
    }
}


/**
 * This Chain gets the relevant url out of an input.
 */
export class UrlChain extends LLMChain{
    
    constructor(fields){
        fields.llm = fields.llm ?? new OpenAI({ temperature: 0 },{ basePath: process.env.PROXY_PATH});
        fields.prompt = fields.promptTemplate ?? new PromptTemplate({
            template: URL_PROMPT, 
            inputVariables: fields.inputVariables
        });
        super(fields);
        this.outputKey = fields.outputKey ?? this.outputKey;
        this.chainName = fields.name ?? this.chainName;
        this.passField = fields.passField ?? this.outputKey;
        this.inputVariables = fields.inputVariables || [];
        this.outputParser = fields.outputParser ?? new getUrlOutputParser();
    }
    async _call(values, runManager){
        debug("UrlChain._call")
        // const record = setupRecorder({mode:process.env.NOCK_MODE});
        // const { completeRecording } = await record('urlChain');
        
        //NOCK START
        const { completeRecording } = await setupRecorder()(`UrlChain_${getIdFromText(JSON.stringify(values))}`);
            let response = await super._call(values,runManager)
        completeRecording()
        //NOCK END

        return response
    }
}



