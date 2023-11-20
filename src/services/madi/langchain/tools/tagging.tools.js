import * as dotenv from 'dotenv'
import { SequentialChain, LLMChain } from "langchain/chains";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { Debug } from '../utils/logger.js'
import { z } from "zod";
import { StructuredTool } from "langchain/tools";
import { ROUTER_PROMPT } from "./analysis.prompt.js"
import { setupRecorder } from "../utils/nockRecord.js";
import { splitHTMLChain } from './components/splitHTML.chain.js'
import { summarizeDocsChain } from "./components/summarizeDocs.chain.js";
import { urlChain } from './components/url.chain.js'
import { fetchChain } from "./components/fetch.chain.js";
import { summarizeSourceChain } from "./components/summarizeSource.chain.js";
import { parseBoolean } from '../utils/boolean.js';
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { TagStore } from '../storage/tag.store.js';

const debug = Debug(import.meta.url)
const llm = new OpenAI({ temperature: 0 },{ basePath: process.env.PROXY_PATH});
dotenv.config()

/**
 * @typedef {import("../types.js").Metadata} Metadata 
 * @typedef {import("../types.js").ServerResponse} ServerResponse
 */




// url -> search -> summary  -> embedding  -> search each level -> Add tags back in -> save

// text -> (embedding -> search each level -> return tags)
                                      







export 




// @ts-ignore
export class TagTool extends StructuredTool{
    name = "TagSearch";
    description = "useful for tagging";

    constructor(options={}){
        super(options)
        this.schema = z.any()
        this.embeddings = new OpenAIEmbeddings();
        Object.keys(options).map(k=>{
            this[k] = options.k
        })
    }

    /** 
     * @param {Array<string,Metadata>} values
     * @returns {Promise<string>} */
    async _call(values){
        if(typeof values === 'string'){
            values = [values, {}]
        }
        let [ text, metadata ] = values

        // get embedding
        let embedding = await this.embeddings.embedQuery(text)

        /* Create instance */
        // Search the tags by type

        let categories = await TagStore.similaritySearchWithOffset(embedding,10,{type:"category"},0)
        // filter

        let subcategories = await TagStore.similaritySearchWithOffset(embedding,10,{type:"subcategory"},0)
        // filter

        let needs = await TagStore.similaritySearchWithOffset(embedding,10,{type:"need"},0)
        // filter
        
        let ilities = await TagStore.similaritySearchWithOffset(embedding,10,{type:"ility"},0)
        // filter

        

        // const record = setupRecorder({mode:process.env.NOCK_MODE});
        // const { completeRecording } = await record('analysisRouter');
        debug("TaggingTool._call")


        return typeof output === 'string' ? output : JSON.stringify(output)
    }
}



// On boot you should load this information
