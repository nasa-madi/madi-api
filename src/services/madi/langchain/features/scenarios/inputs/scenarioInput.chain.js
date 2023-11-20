import { LLMChain } from "langchain/chains";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import * as dotenv from 'dotenv'
import { Debug } from '../../../utils/logger.js'
import { setupRecorder } from "../../../utils/nockRecord.js";
// import { DocumentStore } from "../../storage/document.vectorstore.js";
import { DefaultChain } from "../../../chains/default.chain.js";
// import { DOC_ANALYSIS_PROMPT } from "./summarizeDocs.prompt.js";
import { StructuredOutputParser } from "langchain/output_parsers";
import { parseBoolean } from '../../../utils/boolean.js'

const debug = Debug(import.meta.url)
const llm = new OpenAI({ temperature: 0 },{ basePath: process.env.PROXY_PATH});
dotenv.config()

const parser = StructuredOutputParser.fromNamesAndDescriptions({
  trend:"The trend over time of a specific need or capability.",
  need:"The need or problem described by the user.",
  capability:"The capability, solution, or new technology described by the user."
});

const formatInstructions = parser.getFormatInstructions();


const scenarioInputPrompt = new PromptTemplate({
  // template: SCENARIO_INPUT_PROMPT, 
  template: "{format_instructions} Here is the input that you must format. Remember your response must start with ``` and adhere to the format instructions. \n\nINPUT:\n{input}\n\nRESPONSE:\n",
  inputVariables: ["input"],
  partialVariables: { format_instructions: formatInstructions }
})




export class ScenarioInputChain extends LLMChain{
  constructor(fields){
    fields.prompt = scenarioInputPrompt
    fields.outputParser = parser
    super(fields)
    this.llm = new OpenAI(
      { temperature: 0, 
        verbose: parseBoolean(process.env.VERBOSE) && parseBoolean(process.env.DEBUG)},
      { basePath: process.env.PROXY_PATH}
    );
  }

}



