import { LLMChain } from "langchain/chains";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import * as dotenv from 'dotenv'
import { Debug } from '../../utils/logger.js'
import { DefaultChain } from "../default.chain.js";
import { SOURCE_ANALYSIS_PROMPT } from "./summarizeSource.prompt.js";
import { SourceStore } from "../../storage/source.store.js";
import { getIdFromText } from "../../utils/text.js";
import { setupRecorder } from "nock-record";

const debug = Debug(import.meta.url)
const llm = new OpenAI({ temperature: 0, maxTokens: -1 }, {basePath: process.env.PROXY_PATH});
dotenv.config()
const sourceStore = await SourceStore()

const sourceSummaryPrompt = new PromptTemplate({template: SOURCE_ANALYSIS_PROMPT, inputVariables: ["doctexts","quotelist"]});
const sourceSummaryChain = new LLMChain({
  llm,
  prompt: sourceSummaryPrompt
});

const MAX_TOKENS_LLM = process.env.MAX_TOKENS_LLM ?? 4000;
const MIN_SUMMARY_RESPONSE_TOKENS = 500

function extractActors(list) {
    const elements = list.split('\n').filter(item => item !== ''); // split the string by newline and remove any empty strings
    const cleanElements = elements
        .map(item => item.replace(/^\d+\. /, ''))
        .filter(item => /[a-zA-Z]/.test(item)); // check if the item contains any letters
    return cleanElements;
}

export class SummarizeSourceChain extends DefaultChain{
    
    async _call(input){
        debug('SummarizeSourceChain')
        let source = JSON.parse(input[this.inputVariables[0]])


        if(!source?.metadata?.summary){
            debug('Splitting source anew')
            let docs = source.docs

            //is the source over length on its own?
            const sourceTokenCount = source?.metadata?.tokens ?? 4000
            const promptTokenCount = 300
            const over = sourceTokenCount

            // The prompt plus the input plus the response space must be less than total
            // promptTokenCount + inputTokenCount + MIN_SUMMARY_RESPONSE_TOKENS < MAX_TOKENS_LLM


            // TODO resolve this additional state for long summaries
            // if source is over 150% of allowed, 
            //      get summaries of all the pieces.
            // else
            //      trim the source down to the right size


            // This just merges the sorts, images, and quotes
            docs = docs.sort((a,b)=>a?.metadata?.loc?.lines?.from < b?.metadata?.loc?.lines?.from )

            let concatenatedDocs = docs.map(d=>d?.metadata?.summary).slice().join('\n\n')
            let concatenatedQuotes = docs.map(d=>d?.metadata?.quote).slice(0,10).join('\n\n - ')
            let concatenatedActors = docs.map(d=>d?.metadata?.actors).join(';').split(';').map(d=>d.trim()).filter(d=>d.length)

            // if this doc has not already been summarized
            // TODO make this iterative until desired lenght is reached;
            if(concatenatedDocs.length > 8000 && !source?.metadata?.summary){
                const model = new OpenAI({ temperature: 0 }, {basePath: process.env.PROXY_PATH});
                const prompt = PromptTemplate.fromTemplate("Summarize the following information in about 8 paragraphs:\n\nSUMMARY:\n------------\n{concatenatedDocs}");
                const concatenatedDocsChain = new LLMChain({ llm: model, prompt });
                concatenatedDocs = (await concatenatedDocsChain.call({ concatenatedDocs })).text
            }

            if(concatenatedActors.length > 20){
                const model = new OpenAI({ temperature: 0 }, {basePath: process.env.PROXY_PATH});
                const prompt = PromptTemplate.fromTemplate("Reduce this list of actors to the most relevant 30 actors.  Remove items that are not actors or organizations. Remove concepts or abstract terms. Remove places and countries.  Remove specific individuals unless they are politicians or corporate leaders  Avoid duplicates. Return the list of 30 as a numbered list.\n\nACTORS:\n------------\n{concatenatedActors}\n\n\nNEW LIST:\n");
                const concatenatedActorsChain = new LLMChain({ llm: model, prompt });
                const actorList = concatenatedActors.join('; \n')
                concatenatedActors = (await concatenatedActorsChain.call({ concatenatedActors: actorList })).text

                
            }
        // 

            //NOCK START
            // const { completeRecording } = await setupRecorder()(`summarizeSourceChain_${getIdFromText(concatenatedDocs)}`);
                let { text } = await sourceSummaryChain.call({doctexts: concatenatedDocs, quotelist: concatenatedQuotes})
            // completeRecording()
            //NOCK END

            const regex = new RegExp(/(.*)Quote:(.*)Problem:(.*)Solution:(.*)/gms)
            let matches = regex.exec(text);


          
          

            source.metadata.summary  = matches[1].trim();
            source.metadata.quote    = matches[2].trim();
            source.metadata.problem  = matches[3].trim();
            source.metadata.solution = matches[4].trim();
            //backfill metadata from top fields (that may disappear later)
            source.metadata.title    = source.title
            source.metadata.image    = source.image
            source.metadata.actors   = extractActors(concatenatedActors);
            
            //fill top fields from metadata
            source.summary = source.metadata.summary

            // update the source with the new information
            source = (await sourceStore.patch(source.id, source))[0]
        }else{
            debug('Using DB source')
        }

        
        return {
            [this.outputKey]: JSON.stringify(source)
            // [this.outputKey]: sourceSummaryStringifier(source.metadata)
        }
    }
}


