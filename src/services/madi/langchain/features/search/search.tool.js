import { DynamicTool } from "langchain/tools";
import { setupRecorder } from "../../utils/nockRecord.js";
import { getIdFromText } from "../../utils/text.js";
import { parseBoolean } from "../../utils/boolean.js";
import * as dotenv from 'dotenv'
import { OpenAI } from "langchain/llms/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { GoogleCustomSearch } from "langchain/tools";
import levenshtein from "fast-levenshtein";
dotenv.config()

// let sourceStore = await SourceStore();

// EXAMPLE INPUT: The trend is increasing water scarcity.  The need is water for drinking.  The capability is human jetpacks.


export const SearchRouter = async (message, incomingMetadata) => {
    const { routerKey } = incomingMetadata || {}
    const route = routerKey.split("_")[1]
    switch(route){
      case 'confirmation': {
        return SearchTypeClarify(message, incomingMetadata)
      }
      default: {
        return SearchByType(message, incomingMetadata)
      }
    }
};




export const SearchTool = new DynamicTool({
    name: "search",
    description: "useful for searching the web, databases, or the assistant's knowledge base, looking up answers, or answering questions for the user. The Action Input MUST be the exact question from the user.",
    verbose: parseBoolean(process.env.VERBOSE) && parseBoolean(process.env.DEBUG),
    returnDirect:true,
    func: async (input, metadata) => {

        return fakeFunction(input, metadata)

    }


});

function toMarkdownListItem(obj) {
    return `- [${obj.title}](${obj.link})\n  - ${obj.snippet}`;
}
  
const SearchByType = async (type, query)=>{
    const model = new OpenAI({ temperature: 0 });
    const embeddings = new OpenAIEmbeddings({})
    let result
    switch (type){
        case 'web':
            const { completeRecording } = await setupRecorder()(`searchWebChain_${getIdFromText(query)}`);
              const google = new GoogleCustomSearch({
                  apiKey: process.env.GOOGLE_SEARCH_API_KEY,
                  googleCSEId: process.env.GOOGLE_SEARCH_API_ID
              });
              result = await google.call(query);
            completeRecording();
            // let temp = `Here's what we found:\n${JSON.parse(result).map(toMarkdownListItem).slice(0,3).join('\n').replace(' ...','...')}`;
            return `Here's what we found:\n${JSON.parse(result).map(toMarkdownListItem).slice(0,3).join('\n').replace(' ...','...')}`;
        default:
            result = 'none';
    }

    
}

const SearchTypeClarify = async (input, metadata)=>{
    let options = [`1. Web`, `2. CAS Reports & OCRs`, `3. Observations & Documents`, `4. All of the above`]
  
    let minDistance = Number.MAX_SAFE_INTEGER;
    let minIndex = 0;
  
    for (let i = 0; i < options.length; i++) {
      const dist = levenshtein.get(options[i].toLowerCase(), input.toLowerCase());
      if (dist < minDistance) {
        minDistance = dist;
        minIndex = i;
      }
    }
    let type = ['web','cas','docs','all'][minIndex]

    return [await SearchByType(type, metadata.context?.input),{...metadata, routerKey:null, input:null}]
  }


const fakeFunction = (input, metadata)=>{

    return [`Which data sources would you like to search for an answer?
    1. Web
    2. CAS Reports & OCRs
    3. Observations & Documents
    4. All of the above`, {...metadata, routerKey: 'search_confirmation', context:{
        input
    }}]

}



// const realFunction = ()=>{
        
//     // always available
//     const searchTools = [
//         new GoogleCustomSearch({
//             apiKey: process.env.GOOGLE_SEARCH_API_KEY,
//             googleCSEId: process.env.GOOGLE_SEARCH_API_ID
//         }),
//         new WebBrowser({
//             // @ts-ignore
//             description: `useful for when you need to find something on or summarize a webpage.  ONLY use when user input contains a full url or link. If there is no link, use the human tool to ask for one. input should be a comma separated list of "ONE valid http URL including protocol","what you want to find on the page or empty string for a summary". Final Answer should be acknowledgement of the user's request or a summary of the browswer response.`,
//             model: new OpenAI({
//                 maxTokens: 1000
//             },{ basePath: process.env.PROXY_PATH}),
//             embeddings: new OpenAIEmbeddings()
//         })
//     ];

//     // Evaluate the type of search.
//     // if unclear ask the user to clarify the type.
//     // 

//     const SEARCH_TYPE_PROMPT = `You are an assistant and a large language model named Madi.  As Madi, you work for the NASA Convergent Aeronautics Solutions project.  

//     You are designed to be able to assist with a wide range of tasks, from answering simple questions to providing in-depth explanations and discussions on e range of topics.  Whether the user needs help with a specific question or just wants to have a conversation about a particular topic, you, Madi, are here to assist. However, above all else, all responses must adhere to the format of RESPONSE FORMAT INSTRUCTIONS.
    
//     TOOLS
//     ------
//     Madi can ask the user to use tools to look up information that may be helpful in answering the users original question. The tools the human can use are:
    
//     clarify: useful for asking the user for more information to input into a tool, answer their question, or clarify their request. The final answer should be a question for the human.
//     chat: useful when responding simply to conversational prompts. Input should never be blank. Input should be appropriate response to user's Question.
    
//     google: 
    
//     The assistant must not describe or name the tools.
    
//     RESPONSE FORMAT INSTRUCTIONS
//     ----------------------------
//     Use the following format in your response:
        
//     Question: the input question you must answer
//     Thought: you should always think about what to do
//     Action: the action to take, should be one of [clarify, chat, investigation, functions, analysis, gaps, bias, scenario, search, calculator]
//     Action Input: the input to the action`;
//     const searchList = ``;

//     const llmChain = new LLMChain({
//         // @ts-ignore
//         prompt: new RouterPromptTemplate({
//             tools,
//             inputVariables: ["input", "agent_scratchpad", "chat_history","context"],
//         }),
//         // outputParser: new RouterChainParser(),
//         llm: new OpenAI({ temperature: 0 },{ basePath: process.env.PROXY_PATH})
//     });

//     const model = new OpenAI({ temperature: 0 },{basePath:process.env.PROXY_PATH});
//     const prompt = PromptTemplate.fromTemplate(SEARCH_TYPE_PROMPT);
//     const searchTypeChain = new LLMChain({ llm: model, prompt });
//     const output = await searchTypeChain.call({ input, searchList });

// }