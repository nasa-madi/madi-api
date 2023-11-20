import { LLMChain } from "langchain/chains";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import * as dotenv from 'dotenv'
import { Debug } from '../../../utils/logger.js'
import { SCENARIO_LADDER_PROMPT } from "./scenarioLadder.prompt.js";


const debug = Debug(import.meta.url)
dotenv.config()

const scenarioLadderPrompt = new PromptTemplate({
  template: SCENARIO_LADDER_PROMPT, 
  inputVariables: ["need","capability","trend","framing", "additional_instructions","additional_frames"],
})


export class ScenarioLadderChain extends LLMChain{
  constructor(fields){
    fields.prompt = scenarioLadderPrompt
    super(fields)
    this.llm = new OpenAI(
      { temperature: fields.temperature ?? 1, 
        verbose:fields.verbose ?? false, 
        maxTokens:fields.tokens ?? 2000 
      },{ 
        basePath: process.env.PROXY_PATH
      });
  }
}


