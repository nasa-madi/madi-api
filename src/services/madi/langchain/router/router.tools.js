import * as dotenv from 'dotenv';
dotenv.config()
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { GoogleCustomSearch } from "langchain/tools";
import { FunctionTool } from "../tools/function.tool.js";
import { WebBrowser } from "langchain/tools/webbrowser";
import { OpenAI } from "langchain/llms/openai";
import { Calculator } from "langchain/tools/calculator";
import { ClarifyTool } from "../tools/clarify.tool.js";
import { InvestigationTool } from '../features/investigation/investigation.tool.js'
import { AnalysisTool } from "../features/analysis/analysis.tool.js";
import { ChatTool } from "../tools/chat.tool.js";
import { ScenarioTool } from '../features/scenarios/scenario.tool.js';
import { GapTool } from '../features/gaps/gaps.tool.js';
import { BiasTool } from '../features/bias/bias.tool.js';
import { SearchTool } from '../features/search/search.tool.js';

const routerModel = new OpenAI({ temperature: 0 },{ basePath: process.env.PROXY_PATH});

// always available
export const routerCommonTools = [
    new ClarifyTool({
        model: routerModel
    }),
    new ChatTool({
        model: routerModel,
    }),
    new InvestigationTool(),
    new FunctionTool(),
    new AnalysisTool(),
    GapTool,
    BiasTool,
    ScenarioTool,
    SearchTool,
  ];


// only when investigation is set
export  const routerInvIsSetTools = [
    new Calculator(),

  ]
  // only when investigation is null
export const routerInvIsNotSetTools = [
  
]
  
  
  
  
  