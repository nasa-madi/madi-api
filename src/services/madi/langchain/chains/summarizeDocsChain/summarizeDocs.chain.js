import { LLMChain } from "langchain/chains";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import * as dotenv from 'dotenv'
import { Debug } from '../../utils/logger.js'
import { setupRecorder } from "../../utils/nockRecord.js";
import { DocumentStore } from "../../storage/document.vectorstore.js";
import { DefaultChain } from "../default.chain.js";
import { DOC_ANALYSIS_PROMPT } from "./summarizeDocs.prompt.js";
import { getIdFromText } from "../../utils/text.js";

const debug = Debug(import.meta.url)
const llm = new OpenAI({ temperature: 0 },{ basePath: process.env.PROXY_PATH});
dotenv.config()
const documentStore = await DocumentStore()

const docSummaryPrompt = new PromptTemplate({template: DOC_ANALYSIS_PROMPT, inputVariables: ["doctext"]});
const docSummaryChain = new LLMChain({
  llm,
  prompt: docSummaryPrompt
});

export class SummarizeDocsChain extends DefaultChain{
    
    async _call(input){
        debug('SummarizeDocsChain')

        let values = JSON.parse(input[this.inputVariables[0]])

        let docs = values.docs
        
        //NOCK START
        const { completeRecording } = await setupRecorder()(`summarizeDocsChain_${getIdFromText(input[this.inputVariables[0]])}`);

        // foreach doc 
        let docsPromise = docs.map(async doc=>{
            // run a summarizer chain
            if(doc?.metadata?.summary){
                return doc
            }


            let { text } = await docSummaryChain.call({doctext: doc.pageContent})
     

            const regex = new RegExp(/(.*)Quote:(.*)Problem:(.*)Solution:(.*)Actors:(.*)/gms)
            let matches = regex.exec(text);
            if (matches) {
                doc.metadata.summary  = matches[1].trim();
                doc.metadata.quote    = matches[2].trim();
                doc.metadata.problem  = matches[3].trim();
                doc.metadata.solution = matches[4].trim();
                doc.metadata.actors   = matches[5].trim();
            }

            // store the summary in the metadata of each doc.
            doc = await documentStore.patch(doc.id, doc)
            return doc[0]
        })
        docs = await Promise.all(docsPromise)
        
        completeRecording()
        //NOCK END
        
        return {
            [this.outputKey]:JSON.stringify({
               ...values,
                docs
            })
        }
    }
}


