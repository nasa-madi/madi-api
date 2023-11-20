import { OpenAI } from "langchain/llms/openai";
import * as dotenv from 'dotenv'
import { Debug } from '../utils/logger.js'
import { setupRecorder, recordOptions } from "../utils/nockRecord.js";
import { DefaultChain } from "./default.chain.js";
import { TagStore } from "../storage/tag.store.js";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { z } from 'zod'
const debug = Debug(import.meta.url)
dotenv.config()

const llm = new OpenAI({ temperature: 0 },{ basePath: process.env.PROXY_PATH});
const tagStore = await TagStore()


// CORE FUNC
// text goes in
// categories come out

// CHAIN
// text goes in
// categories come out (as string) in tuple

// TOOL
// text goes in
// categories come out (as response)
export const categorizeText = async (text, embeddings = new OpenAIEmbeddings())=>{

    // get embedding
    let embedding = await embeddings.embedQuery(text)

    // Search the tags by type
    let categories = await tagStore.similaritySearchWithOffset(embedding,10,{type:"category"},0)
    // filter

    let subcategories = await tagStore.similaritySearchWithOffset(embedding,10,{type:"subcategory"},0)
    // filter

    let needs = await tagStore.similaritySearchWithOffset(embedding,10,{type:"need"},0)
    // filter
    
    let ilities = await tagStore.similaritySearchWithOffset(embedding,10,{type:"ility"},0)
    
    // filter

    return {
        text,
        embedding,
        categories,
        subcategories,
        needs,
        ilities
    }
}





export class CategorizeTextChain extends DefaultChain{

    constructor(options={}){
        super(options)
        this.schema = z.any()
        this.embeddings = new OpenAIEmbeddings();
        Object.assign(this, options)
    }

    async _call(text){
        debug('CategorizeTextChain')
        // let text = JSON.parse(input[this.inputVariables[0]])

        const record = setupRecorder({mode:process.env.NOCK_MODE});
        const { completeRecording } = await record('CategorizeTextChain', recordOptions);

        let {
            embedding,
            categories,
            subcategories,
            needs,
            ilities
        } = await categorizeText(text, this.embeddings)
        completeRecording();

        return {
            text,
            embedding,
            categories,
            subcategories,
            needs,
            ilities
        }
    }
}




