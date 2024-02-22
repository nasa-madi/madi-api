import { toolFuncs, toolDescs, defaultTools } from "../../plugin-tools/index.js";
import crypto from 'crypto'

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
    let { data } = await this.find(_params)
    return data.find(item => item.function.name === toolName);
  }

  async create(data, params) {
    // get available tools

    let authorizedTools = await this.getAuthorizedTools(params)


0
    let { tool_calls } = data
    tool_calls = Array.isArray(tool_calls)?tool_calls:[tool_calls]
    let response = []
    for (const toolCall of tool_calls) {
      let pluginName = toolCall?.function?.name
      let pluginResponse = ''
      let partial 
      let nextCall
      if(authorizedTools.map(t=>t?.function?.name).includes(pluginName)){
        
            
        // get the function or class
        const pluginToCall = toolFuncs[pluginName];
        let pluginInstance = new pluginToCall({
          documents: this.options.app.service('documents'),
          chunks: this.options.app.service('chunks'),
          uploads: this.options.app.service('uploads'),
          chats: this.options.app.service('chats'),
          tools: this.options.app.service('tools')
        })
        
        // get the arguments
        const pluginArgs = typeof toolCall.function.arguments === 'string' 
        ? JSON.parse(toolCall?.function?.arguments)
        : toolCall?.function?.arguments

        let result = await pluginInstance.run(pluginArgs, params);


        if (typeof result == 'string'){
          pluginResponse = result
        }else{
          pluginResponse = result.content
          partial = result.partial
          nextCall = result.nextCall
        }

      }else{
        throw new Error(`Tool ${pluginName} is not allowed or not available.`)
      }

      var id = crypto.randomBytes(20).toString('hex');

      // update the messages to include the tool calls  
      response.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: pluginName,
          content: pluginResponse
      },partial?
      {
        "role": "assistant",
        "content": null,
        "tool_calls": [
          {
            tool_call_id: id,
            type: 'function',
            function: nextCall
          }
        ]
      }:undefined);
    }
    return response
  }
}

export const getOptions = (app) => {
  return { 
    app
  }
}
