import { redisClient } from "../../utils/redis.js";
import { RedisVectorStore } from "langchain/vectorstores/redis";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { Document } from "langchain/document";
import { Debug } from '../../utils/logger.js'
import { INVESTIGATION_PROMPT } from "./investigation.prompts.js";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { StructuredTool } from "langchain/tools"
import { z } from "zod";
import fs from 'fs'
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function readFileAsync(path) {
    return fs.promises.readFile(__dirname +"/"+ path, "utf-8");
}

const debug = Debug(import.meta.url)

/**
 * @typedef {import("../../types.js").Metadata} Metadata 
 * @typedef {import("../../types.js").ServerResponse} ServerResponse
 */


const createInvestigationStore = async () => {
    // // const splitter = new RecursiveCharacterTextSplitter()
    // // const splitDocs = await splitter.splitDocuments(docs);
    const embeddings = new OpenAIEmbeddings()

    let investigationVectorStore = new RedisVectorStore(
        embeddings,
        {
            redisClient,
            indexName: "investigations"
        }
    )
    redisClient.on('ready', async ()=>{
        let exists = await investigationVectorStore.checkIndexExists()
        if(!exists){
            try{
                let investigations = await readFileAsync('../../data/investigations.json')
                investigations = JSON.parse(investigations)
                investigations = Array.isArray(investigations) ? investigations : []
                let docs = investigations.map(({id, description, name})=>{
                    return new Document({
                        pageContent: name+"\n"+description.slice(0,2000), 
                        metadata:{name,id}
                    })
                })
                investigationVectorStore = await RedisVectorStore.fromDocuments(
                    docs,
                    embeddings,
                    {
                        redisClient,
                        indexName: "investigations",
                    }
                )
            }catch(e){
                console.log(e)
            }
        

        }
    })
    return investigationVectorStore
}

export const investigationVectorStore = await createInvestigationStore()

/**
 * Router LLM
 * The result is an object with a `text` property.  
 */
const investigationModel = new OpenAI({ temperature: 0, maxTokens: 150}, { basePath: process.env.PROXY_PATH});
const investigationPrompt = PromptTemplate.fromTemplate(INVESTIGATION_PROMPT);

const investigationChain = new LLMChain({ llm: investigationModel, prompt: investigationPrompt });


// @ts-ignore
export class InvestigationTool extends StructuredTool {
    name = "investigation";
    description = "useful for allowing the user to select an investigation as context. You should only use this tool the user mentions changing or picking an investigation topic.  Do NOT use this tool for searching, lookup information, answering questions. This tool MUST be limited to a very specific request to select an investigation topic.";

    constructor(options={}){
        super();
        this.name = options.name || this.name
        this.description = options.description || this.description
        this.returnDirect = true
        this.model = options.model || new OpenAI()

        this.metadata = options.metadata || {}
        this.schema = z.any();
        // z.object({ // metadata
        //     chat_history: z.array(z.any()),
        //     log: z.string(),
        //     message: z.string(),
        //     metadata: z.object({
        //         context: z.object({}),
        //         routerkey: z.string().optional(),
        //         clientMemory: z.string().array().optional(),
        //         memId: z.string().optional()
        //     }),
        //     tool: z.string(),
        //     toolInput: z.string()
        // })
    }

    /**
    //  * 
    //  * @param {string} arg 
    //  * @param {array} callbacks 
    //  * @returns {Promise<[string, Metadata]>}
    //  */
    // async call(arg, callbacks) {
    //     const parsed = await this.schema.parseAsync(arg);
    //     const callbackManager_ = await CallbackManager.configure(callbacks, this.callbacks, { verbose: this.verbose });
    //     const runManager = await callbackManager_?.handleToolStart({ name: this.name }, typeof parsed === "string" ? parsed : JSON.stringify(parsed));
    //     let result;
    //     try {
    //         result = await this._call(parsed);
    //     }
    //     catch (e) {
    //         await runManager?.handleToolError(e);
    //         throw e;
    //     }
        
    //     await runManager?.handleToolEnd(result[0]); // this is required for the tuple response
    //     return result;
    // }

    /**
     * 
     * @param {string} actionInput
     * @returns {Promise<[string, Metadata]>
     */
    async _call(actionInput){

        //NOCK START
        // const { completeRecording } = await setupRecorder()(`InvestigationTool_${getIdFromText(message)}`);  
        let response = await investigationChain.call({ input: actionInput }).then(result=>result?.text.trim() || null)
        // completeRecording()
        //NOCK END


        if(response.toLowerCase() === 'selection'){
            return InvestigationPicker(actionInput, this.metadata)
        }
        return [response, this.metadata]; //only works because of return direct setting.
    }
}


/**
 * Investigation Search
 * The result is an object with a `text` property.  
 */
export const InvestigationPicker = async (input, metadata)=>{
    debug('InvestigationPicker')
    const investigations = await redisClient.ft.search('investigations', '*');
    const names = investigations?.documents.map(d=>{
        return (JSON.parse(`${d?.value?.metadata||""}`.split("\\-").join("-"))).name
    })
    return [
        `Which Investigation are you working on? \n${names.map((text,i)=>(` ${i+1}. ${text}`)).join("\n")}`,
        {
            ...metadata,
            // responseType: 'list',
            // choices: names,
            routerKey: 'investigation_confirmation'
        }
    ]
}


/**
 * 
 * @param {string} input 
 * @param {Metadata} metadata
 * @returns {Promise<Array<string, Metadata>>}
 */
export const InvestigationConfirmation = async (input, metadata)=>{
    debug('InvestigationConfirmation')
    return [
        `Great. Your Investigation is now set to ${input}`, 
        // @ts-ignore
        {
            ...metadata,
            context:{
                ...metadata.context,
                investigation: input,
            },
            routerKey: null
        }
    ]
}