import { OpenAI } from "langchain/llms/openai";
import * as dotenv from 'dotenv'
import { Debug } from '../utils/logger.js'
import { setupRecorder } from "../utils/nockRecord.js";
import { DefaultChain } from "./default.chain.js";
import { SourceStore } from "../storage/source.store.js";
import { OpenAIEmbeddings } from "langchain/embeddings/openai"
import { z } from 'zod'
import { getProperty } from "dot-prop";
import { categorizeText } from "./categorizeText.chain.js";
import { getIdFromText } from "../utils/text.js";
const debug = Debug(import.meta.url)
dotenv.config()

// const llm = new OpenAI({ temperature: 0 },{ basePath: process.env.PROXY_PATH});
// const tagStore = await TagStore()
const sourceStore = await SourceStore()


// CORE FUNC
// text goes in
// categories come out

// CHAIN
// text goes in
// categories come out (as string) in tuple

// TOOL
// text goes in
// categories come out (as response)

// Dystopian Scenario:  This is a three or four paragraph narrative using the information above to describe a movie plot. It must be very specific in referencing technologies, locations, capabilities, trends, actors, and needs.  It should focus on describing the causal and cascading effects of the core need.  It should imagine second-order and third-order impacts to the changes to society created by the actors, trends, or technologies.

// Potential Solutions: Explore currently impossible or improbable technological advances that would mitigate the problems described above.  Use very recent scientific breakthroughs as the jumping off point.  It is important that the solution technologies not be commonplace.  Focus on technologies in aviation, automation, drones, space science, chemical research.  You an also suggest specific interventions by new or existing poltical organizations.  If the organization is not currently doing this work, suggest members and mechanisms for leverage to change the political system.
export class CategorizeSourceChain extends DefaultChain{

    constructor(options={}){
        super(options)
        this.schema = z.any()
        this.embeddings = new OpenAIEmbeddings();
        Object.assign(this, options)
    }

    async _call(sourceJson){
        debug('CategorizeSourceChain')


        let source
        
        if(typeof sourceJson === 'string'){
            source = JSON.parse(sourceJson)
        }
        if(typeof sourceJson === 'object' && typeof sourceJson[this.inputVariables[0]] ==='string'){
            source = JSON.parse(sourceJson[this.inputVariables[0]])
        }


        if(!source.metadata?.category){
            let text = source.summary || ''

            //NOCK START
            const { completeRecording } = await setupRecorder()(`categorizeSourceChain_${getIdFromText(text)}`);
                let {
                    categories,
                    subcategories,
                    needs,
                    ilities
                } = await categorizeText(text, this.embeddings)
            completeRecording();
            //NOCK END

            const getName = (doc)=>{
                return getProperty(doc, "[0].metadata.name")
            }

            source.metadata.category = getName(categories[0])
            source.metadata.subcategories = getName(subcategories[0])
            source.metadata.need = getName(needs[0])
            source.metadata.ility = getName(ilities[0])

            source.metadata.tags = [
                source.metadata.category,
                source.metadata.subcategories,
                source.metadata.need,
                source.metadata.ility, 
            ].filter(t=>!!t);

            

            source = (await sourceStore.patch(source.id, source))[0]
        }
        return {
            [this.outputKey]:JSON.stringify(source)
        }
    }
}




