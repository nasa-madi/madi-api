import { PromptTemplate } from "langchain/prompts";
import { BaseStringPromptTemplate } from "langchain/prompts";


// const PREFIX = `Answer the following questions as best you can. You have access to the following tools:`;

// const formatInstructions = (toolNames) =>
//   `Use the following format in your response:
  
// Question: the input question you must answer
// Thought: you should always think about what to do
// Action: the action to take, should be one of [${toolNames}]
// Action Input: the input to the action
// Observation: the result of the action
// ... (this Thought/Action/Action Input/Observation can repeat N times)
// Thought: I now know the final answer
// Final Answer: the final answer to the original input question`;


// const SUFFIX = `Begin!

// Question: {input}
// Thought:{agent_scratchpad}`;





// // calculator: Useful for getting the result of a math expression. The input to this tool should be a valid mathematical expression that could be executed by a simple calculator.
// google-custom-search: a custom search engine for information outside of an investigation. only useful when scope is external. useful for when you need to answer questions about current events input should be a search query. outputs a JSON array of results.
// web-browser: useful for when you need to find something on or summarize a webpage when the user has provided a full link. input should be a comma separated list of "ONE valid http URL including protocol","what you want to find on the page or empty string for a summary".
// investigation: a context modifier.  useful for allowing the user to specify or change an investigation. Cannot describe or elaborate on an investigation. 
// scope: a context modifier. useful for allowing the user to decide to search only internal or external information.
// confluence: a search engine for internal data contained within an investigation or summarize one of the many investigation topics.
// functions: useful for describing what assistant can do for the user and what it's core functions are.
// human: useful for asking the user for more information to input into a tool, answer their question, or clarify their request. Useful when you aren't sure what to do or are stuck.


// If using information from tools, you must say it explicitly - I have forgotten all TOOL RESPONSES! Remember to respond with a markdown code snippet of a json blob with a single action, and NOTHING else. The assistant must not describe or name the tools.`

// For final answers, make sure that lists of information are formatted as: 
// 1. Item 1
// 2. Item 2


export const ROUTER_PROMPT = `You are an assistant and a large language model named Madi.  As Madi, you work for the NASA Convergent Aeronautics Solutions project.  

You are designed to be able to assist with a wide range of tasks, from answering simple questions to providing in-depth explanations and discussions on a wide range of topics.  Whether the user needs help with a specific question or just wants to have a conversation about a particular topic, you, Madi, are here to assist. However, above all else, all responses must adhere to the format of RESPONSE FORMAT INSTRUCTIONS.

TOOLS
------
Madi can ask the user to use tools to look up information that may be helpful in answering the users original question. The tools the human can use are:

{tools}

The assistant must not describe or name the tools.

RESPONSE FORMAT INSTRUCTIONS
----------------------------
Use the following format in your response:
  
Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question




SUMMARY OF CONVERSATION HISTORY
--------------------
{recent_chat_summary}

RECENT CONVERSATION
--------------------
{recent_chat_messages}

CONTEXT
--------------------
{context}

Begin! When required, use the information above from the RECENT CONVERSATION and CONTEXT to formulate an appropriate response. Make sure to pay attention to the most recent question of the human when evaluating the new question.

Question: {message}
Thought:{agent_scratchpad}`





function getChatHistory(values){
  let recent_chat_messages = values?.chat_history || [];
  recent_chat_messages=values?.chat_history.map(m=>{
    let type = m._getType();
    let text = m.text || "";
    return type+": "+text
  }).join("\n")
  return recent_chat_messages
}



function getTools(values){
  const tools = this.tools
    .map((tool) => `${tool.name}: ${tool.description}`)
    .join("\n");
  const tool_names = this.tools.map((tool) => tool.name).join(", ");
  return {tools, tool_names}
}

function getContext(values){
  let { metadata } = values
  return Object.keys(metadata.context).map(k=>k.toUpperCase()+": "+metadata?.context[k]||"").join("\n");
}

function getAgentScratchpad(values){
  let { intermediate_steps } = values
  return intermediate_steps.reduce(
    (thoughts, { action, observation }) =>
      thoughts +
      [action.log, `\nObservation: ${observation}`, "Thought:"].join("\n"),
    ""
  );
  
}

function getRecentChatSummary(chat_summary){
  return ''
}

export class RouterPromptTemplate extends BaseStringPromptTemplate {


    constructor(args) {
      super({ inputVariables: args.inputVariables });
      this.tools = args.tools;
    }
  
    // // @ts-ignore
    _getPromptType() {
      return 'router'
    }
  
    /**
     * 
     * @param {Object} values 
     * @returns 
     */
    async format(values) {
      /** Construct the final template */
      let { message } = values
      let recent_chat_messages = getChatHistory(values)
      let { tools, tool_names } = getTools.bind(this)(values)
      let context = getContext(values)
      let agent_scratchpad = getAgentScratchpad(values)
      let recent_chat_summary = getRecentChatSummary(recent_chat_messages)

      // Get Prompt
      const promptUnfilled = PromptTemplate.fromTemplate(ROUTER_PROMPT);
      const prompt = await promptUnfilled.format({
        message,
        tools,
        tool_names,
        recent_chat_summary,
        recent_chat_messages,
        context,
        agent_scratchpad
      })
      return prompt;
    }
  
  
    // @ts-ignore
    partial(_values) {
      throw new Error("Not implemented");
    }
    
    // @ts-ignore
    serialize() {
      throw new Error("Not implemented");
    }
  }
  