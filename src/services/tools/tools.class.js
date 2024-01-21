import { toolFuncs, toolDescs, defaultTools } from "../../plugin-tools/index.js";

// This is a skeleton for a custom service class. Remove or add the methods you need here
export class ToolService {
  constructor(options) {
    this.options = options
  }


  async getAuthorizedTools(params){


    // get the user
    let user = params.user || {}
    // let usersToolNames = user.tools || defaultTools
    let usersToolNames = defaultTools
    console.log(usersToolNames)
    let allToolNames = Object.keys(toolDescs);
    console.log(allToolNames)
    let intersectionToolNames = allToolNames.filter(value => usersToolNames.includes(value));
    console.log(intersectionToolNames)
    let intersectionTools = intersectionToolNames.map(name => Object.assign({},toolDescs[name]));
    console.log(intersectionTools)
    return intersectionTools

  }

  async find(_params) {
    let authorizedTools = await this.getAuthorizedTools(_params)
    console.log(authorizedTools)
    const sortedData = authorizedTools.sort((a, b) => {
      if(a.function.name < b.function.name) { return -1; }
      if(a.function.name > b.function.name) { return 1; }
      return 0;
    });

    return {
      skip: 0,
      limit: 0,
      total: sortedData.length,
      data: sortedData
    }
  }

  async get(toolName, _params) {
    let { data } = await this.find(_params)
    return data.find(item => item.function.name === toolName);
  }

  async create(data, params) {
    // get available tools
    let authorizedTools = await this.getAuthorizedTools(params)


    let { tool_calls } = data
    tool_calls = Array.isArray(tool_calls)?tool_calls:[tool_calls]
    let response = []
    for (const toolCall of tool_calls) {
      let functionName = toolCall?.function?.name
      let functionResponse
      if(authorizedTools.map(t=>t?.function?.name).includes(functionName)){
        const functionToCall = toolFuncs[functionName];
        const functionArgs = typeof toolCall.function.arguments === 'string' 
          ? JSON.parse(toolCall?.function?.arguments)
          : toolCall?.function?.arguments
        functionResponse = await functionToCall(functionArgs);
      }else{
        throw new Error(`Tool ${functionName} is not allowed or not available.`)
      }

      // update the messages to include the tool calls
      response.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: functionResponse,
      });
    }
      
    return response
  }
}

export const getOptions = (app) => {
  return { app }
}
