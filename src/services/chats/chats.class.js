import _ from 'lodash'
import * as openaiAdapter from './chats.openai.js'
import { logger } from '../../logger.js'
// import * as geminiAdapter from './chats.gemini.js'

const LOGKEY = 'CHAT: '

export class ChatService {
  constructor(options) {
    this.options = options
  }

  async create(data, params) {
    let { messages, tools, tool_choice } = data
    logger.info(LOGKEY + 'create: ' + messages?.slice(-1)[0]?.content.replace(/\n/g, '\\n').substring(0, 100) + '...');
    let stream = !!data.stream
    let options = {
      stream,
      messages, 
      tools: (tools)?tools.map(t=>_.omit(t,['plugin','display'])):undefined, 
      tool_choice: (tools)?tool_choice:undefined
    }

    return openaiAdapter.makeRequest(
      options, // params
      this.options.app.openai,  // shared instance
      this.options.app.get('openai').key // API KEY
    )
  }
}

export const getOptions = (app) => {
  return { app }
}