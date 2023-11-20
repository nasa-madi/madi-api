import { LLMChain } from "langchain/chains";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import * as dotenv from 'dotenv'
import { Debug } from '../../../utils/logger.js'
import { setupRecorder } from "../../../utils/nockRecord.js";
import { SCENARIO_BUILD_PROMPT } from "./scenarioBuild.prompt.js";

const debug = Debug(import.meta.url)
dotenv.config()

const scenarioBuildPrompt = new PromptTemplate({
  template: SCENARIO_BUILD_PROMPT, 
  inputVariables: ["ladder","framing","need","capability","trend","additional_instructions","additional_frames"],
})


export class ScenarioBuildChain extends LLMChain{
  constructor(fields){
    fields.prompt = scenarioBuildPrompt
    super(fields)
    this.llm = new OpenAI(
      { temperature: fields.temperature ?? 1, verbose:fields.verbose ?? false, maxTokens:fields.tokens ?? 2000 },
      { basePath: process.env.PROXY_PATH}
    );
  }
}


