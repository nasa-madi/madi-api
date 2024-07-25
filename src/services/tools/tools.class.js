import { toolFuncs, toolDescs, toolRefreshFuncs, defaultTools } from "../../plugins.js";

// This is a skeleton for a custom service class. Remove or add the methods you need here
export class ToolService {
  constructor(options) {
    this.options = options
  }


  async getAuthorizedTools(params){

    // get the user
    let user = params.user || {}
    let usersToolNames = defaultTools
    let allToolNames = Object.keys(toolDescs);
    let intersectionToolNames = allToolNames.filter(value => usersToolNames.includes(value));
    let intersectionTools = intersectionToolNames.map(name => Object.assign({},toolDescs[name]));
    return intersectionTools

  }

  async find(_params) {

    let authorizedTools = await this.getAuthorizedTools(_params)

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
    console.log(toolFuncs,toolDescs,defaultTools)
    let { data } = await this.find(_params)
    return data.find(item => item.function.name === toolName);
  }

  async refreshData (data, params) { 
    let authorizedTools = await this.getAuthorizedTools(params)

    let toolName = data?.toolName
    if(!toolName){
      throw new Error(`You must set a toolName in your refreshData call.`)
    }

    let refreshResponse = {}
    if(authorizedTools.map(t=>t?.function?.name).includes(toolName)){
      const refreshFunction = toolRefreshFuncs[toolName];
      refreshResponse = await refreshFunction(data, params);
    }else{
      throw new Error(`Tool ${toolName} is not allowed or not available.`)
    }
    return refreshResponse
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
        functionResponse = await functionToCall({data:functionArgs}, params);
        if (typeof functionResponse !== 'string') {
          if (typeof functionResponse === 'object' && functionResponse !== null) {
            functionResponse = JSON.stringify(functionResponse);
          } else {
            throw new Error('Function response must be a string or an object.');
          }
        }
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
