import * as dotenv from 'dotenv'
import { SequentialChain, LLMChain } from "langchain/chains";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { z } from "zod";
import { StructuredTool } from "langchain/tools";
import { ROUTER_PROMPT } from "./analysis.prompt.js"

import { parseBoolean } from '../../utils/boolean.js';
import { setupRecorder } from "../../utils/nockRecord.js";
import { Debug } from '../../utils/logger.js'
import { analysisStringifier } from './analysis.toString.js';

import { SplitFromHTMLChain } from '../../chains/splitHTML.chain.js'
import { SummarizeDocsChain } from "../../chains/summarizeDocsChain/summarizeDocs.chain.js";
import { UrlChain } from '../../chains/urlChain/url.chain.js'
import { FetchChain } from "../../chains/fetchChain/fetch.chain.js";
import { SummarizeSourceChain } from "../../chains/summarizeSourceChain/summarizeSource.chain.js";
import { CategorizeSourceChain } from "../../chains/categorizeSource.chain.js"

const debug = Debug(import.meta.url)
const llm = new OpenAI({ temperature: 0 },{ basePath: process.env.PROXY_PATH});
dotenv.config()

/**
 * @typedef {import("../../types.js").Metadata} Metadata 
 * @typedef {import("../../types.js").ServerResponse} ServerResponse
 */





const urlChain = new UrlChain({ //takes in text from the user and attempts to identify the url 
    name: 'UrlChain',
    inputVariables: ["userinput"],
    outputKey: "url", // outputs the url
    // outputParser: new getUrlOutputParser()
});

const fetchChain = new FetchChain({ // takes in url and 
    name: 'fetchChain',
    inputVariables: ["url"],
    outputKey: "scrapedJson" // outputs stringified JSON
})

const splitHTMLChain = new SplitFromHTMLChain({ // takes in the json of the scraped webpage
    name: 'splitHTMLChain',
    inputVariables: ["scrapedJson"],
    splitOnField: "content",
    outputKey: "withDocsJson" // outputs the same json string but with docs split out
})

const summarizeDocsChain = new SummarizeDocsChain({ // takes in the json with docs:[{...}] field and summarizes each doc
    name: 'summarizeDocsChain',
    inputVariables: ["withDocsJson"],
    outputKey: "summarizedDocsJson", // returns json with summarized docs
})

const summarizeSourceChain = new SummarizeSourceChain({ //  takes in json with summarize docs
    name: 'summarizeSourceChain',
    inputVariables: ["summarizedDocsJson"],
    outputKey: "summarizedSourceJson", // returns the summarized Source as a renderable string
})

const categorizeSourceChain = new CategorizeSourceChain({
    name: 'categorizeSourceChain',
    inputVariables: ["summarizedSourceJson"],
    outputKey: "chainOutput"
})


// no url   -> CLARIFY(url) -> WEB-BROWSER(text) -> ANALYSIS(data)
// no text  -> CLARIFY(url)                      -> ANALYSIS(data)
// url                      -> WEB-BROWSER(text) -> ANALYSIS(data)
// text                                          -> ANALYSIS(data)

/**
 * These are the two types of chains for analyzing text
 */
const askUrlAnalysisChain = new SequentialChain({
    chains: [
        urlChain, 
        fetchChain,
        splitHTMLChain,
        summarizeDocsChain,
        summarizeSourceChain,
        categorizeSourceChain,
    ],
    inputVariables: ["userinput"],
    // Here we return multiple variables
    outputVariables: [
        "chainOutput"
        // "analysis"
    ],
    verbose:parseBoolean(process.env.VERBOSE) && parseBoolean(process.env.DEBUG)
});

// const askTextAnalysisChain = new SequentialChain({
//     chains: [getAnalysisChain],
//     inputVariables: ["fulltext"],
//     // Here we return multiple variables
//     outputVariables: ["fulltext", "trimtext", "analysis"],
//     verbose: true,
// });

                                      

// @ts-ignore
export class AnalysisTool extends StructuredTool{
    name = "analysis";
    description = "useful for summarizing or adding an article to the data. For this tool to work, the user MUST ABSOLUTELY provide a very long, multi-sentence input OR the user must provide a URL in the question.";

    // pick the right tool
    constructor(options={}){
        super(options)
        this.schema = z.any()
        Object.keys(options).map(k=>{
            this[k] = options.k
        })
        
    }

    /**
     *
     * @param {Array<string,Metadata>} values
     * @returns {Promise<string>}
     */
    async _call(values){
        // const record = setupRecorder({mode:process.env.NOCK_MODE});
        // const { completeRecording } = await record('analysisRouter');
        debug("analysisTool._call")
        const analysisRouterTemplate = new PromptTemplate({template: ROUTER_PROMPT, inputVariables: ["userinput"]});
        const analysisRouterChain = new LLMChain({llm, prompt: analysisRouterTemplate });
        let routerResult = await analysisRouterChain.call({userinput:values})
        this.returnDirect = true;
        // completeRecording()
        let output
        switch(routerResult.text.trim()){
            case 'URL':
                let analyzed = (await askUrlAnalysisChain.call({userinput:values}))[askUrlAnalysisChain.outputVariables[0]]
                let {metadata} = JSON.parse(analyzed)
                if(metadata.actors){
                    metadata.actors = metadata.actors.join(', ')
                }
                output = analysisStringifier(metadata)
                break;
            case 'TEXT':
                // output = await askTextAnalysisChain.call({userinput:values})
                break;
            default:
                output = routerResult.text.trim()
        }

        // this is where you modify the closure metadata object


        // THIS IS WHERE YOU PARSE THE STRUCTURE FOR THE NECESSARY KEYS, THEN PASS AS STRINGIFIED JSON
        return typeof output === 'string' ? output : JSON.stringify(output)
    }
}