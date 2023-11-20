import { OpenAI } from "langchain/llms/openai";
import { playwrightScraper } from "./playwright.loader.js";
import * as dotenv from 'dotenv'
import { Debug } from '../../utils/logger.js'
import { setupRecorder } from "../../utils/nockRecord.js";
import { DocumentStore } from "../../storage/document.vectorstore.js";
import { SourceStore } from "../../storage/source.store.js";
// import { Tiktoken } from "js-tiktoken/lite";
// import encoding from '../../utils/cl100k_base.json' assert {type:"json"};
import { Tiktoken } from "tiktoken/lite";
import cl100k_base from "tiktoken/encoders/cl100k_base.json" assert {type:"json"};

let tokenizer = new Tiktoken(  
    cl100k_base.bpe_ranks,
    cl100k_base.special_tokens,
    cl100k_base.pat_str);



import { DefaultChain } from "../default.chain.js";

const debug = Debug(import.meta.url)
const llm = new OpenAI({ temperature: 0 },{ basePath: process.env.PROXY_PATH});
dotenv.config()
const enableStorage = true;
const sourceStore = await SourceStore()
const documentStore = await DocumentStore()

/**
 * @typedef {import("../../types.js").Metadata} Metadata 
 * @typedef {import("../../types.js").ServerResponse} ServerResponse
 */


/**
 * This chain fetches a url and returns a JSON stringified response from article-exctractor library
 */
export class FetchChain extends DefaultChain{
    async _call({url}){
        debug("FetchChain._call")

        let response = await sourceStore.createOrRetrieveCallback({
            url
        }, async (source)=>{
        
            let scrapeResult = await playwrightScraper(source.url)
        
            return {
                ...scrapeResult,
                // type: 'web',
                // source: scrapeResult.source,
                published: new Date(scrapeResult.published).toISOString(),
                metadata:{
                    tokens: tokenizer.encode(scrapeResult.content).length,
                    // links: scrapeResult.links,
                    // image: scrapeResult.image,
                    // summary: scrapeResult.summary,
                    // title: scrapeResult.title,
                }
            }
        })

        return {
            [this.outputKey]:JSON.stringify(response[0]),
        }
    }
}

