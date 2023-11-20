
import * as dotenv from 'dotenv'
import { Debug } from '../utils/logger.js'
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { setupRecorder } from "../utils/nockRecord.js";
import { DocumentStore } from "../storage/document.vectorstore.js";
import { wordWrap } from '../utils/text.js';
import { DefaultChain } from "./default.chain.js";
// import { Tiktoken } from "js-tiktoken/lite";
// let tokenizer = new Tiktoken(encoding);
// import encoding from '../utils/cl100k_base.json' assert {type:"json"};


import { Tiktoken } from "tiktoken/lite";
import cl100k_base from "tiktoken/encoders/cl100k_base.json" assert {type:"json"};

let tokenizer = new Tiktoken(  
    cl100k_base.bpe_ranks,
    cl100k_base.special_tokens,
    cl100k_base.pat_str);



const debug = Debug(import.meta.url)
dotenv.config()
const documentStore = await DocumentStore()
const SOURCE_CHARS_PER_LINE = parseInt(process.env.SOURCE_CHARS_PER_LINE) ?? 100

/**
 * @typedef {import("../types.js").Metadata} Metadata 
 * @typedef {import("../types.js").ServerResponse} ServerResponse
 */



export class SplitFromHTMLChain extends DefaultChain{
    
    async _call(input){
        debug("splitFromHTMLChain")
        // const record = setupRecorder({mode:process.env.NOCK_MODE});
        // const { completeRecording } = await record('splitFromHTMLChain');
        let values = JSON.parse(input[this.inputVariables[0]])
        let text = values[this.splitOnField]

        //split the source into multiple docs
        let splitter = RecursiveCharacterTextSplitter.fromLanguage("html", {
            chunkSize: 4000,
            chunkOverlap: 300,
        })
        // we have to artificially add in \n in order to get line locations in the docs.
        text = wordWrap(text, SOURCE_CHARS_PER_LINE)

        let docs = await splitter.createDocuments([text])

        let docsPromise = docs.map(async doc=>{
            return documentStore.createOrRetrieveCallback(doc,(d)=>{
                // get token length and hash for each doc
                d.metadata.tokens = tokenizer.encode(d.pageContent).length
                d.metadata.parentHash = values['hash']
                d.metadata.parentId = values['id']
                d.metadata.url = values['url'] || null
                d.metadata.source = values['source'] || null
                d.metadata.published = values['published'] || null
                return d
            })
        })
        
        docs = (await Promise.all(docsPromise)).map(d=>d[0])
        // completeRecording()
        return {
            [this.outputKey]:JSON.stringify({
               ...values,
                docs
            })
        }
    }
}
