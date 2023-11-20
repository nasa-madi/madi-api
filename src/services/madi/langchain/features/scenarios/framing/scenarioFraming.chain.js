import { LLMChain } from "langchain/chains";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import * as dotenv from 'dotenv'
import { Debug } from '../../../utils/logger.js'
import { setupRecorder } from "../../../utils/nockRecord.js";
// import { DocumentStore } from "../../storage/document.vectorstore.js";
import { DefaultChain } from "../../../chains/default.chain.js";
// import { DOC_ANALYSIS_PROMPT } from "./summarizeDocs.prompt.js";
import { SCENARIO_FRAMING_PROMPT } from "./scenarioFraming.prompt.js";
import { StructuredOutputParser } from "langchain/output_parsers";
import { BaseOutputParser } from "langchain/schema/output_parser";

const debug = Debug(import.meta.url)
dotenv.config()

const scenarioFramingPrompt = new PromptTemplate({
  template: SCENARIO_FRAMING_PROMPT, 
  inputVariables: ["need","capability","trend","additional_instructions","additional_frames"],
})


export class ScenarioFramingChain extends LLMChain{
  constructor(fields){
    fields.prompt = scenarioFramingPrompt
    super(fields)
    this.llm = new OpenAI(
      { temperature: 0, 
        verbose: fields.verbose ?? false,
        maxTokens: fields.maxTokens ?? 2000 
      },
      { basePath: process.env.PROXY_PATH}
    );
  }
}


