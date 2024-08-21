// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { logger } from '../../logger.js';
import { authorizeHook } from '../../auth/authorize.hook.js'
import { streamToSSE } from '../utils/koaSSE.js'
import {
  chatDataValidator,
  chatQueryValidator,
  chatResolver,
  chatDataResolver,
  chatQueryResolver
} from './chats.schema.js'
import { ChatService, getOptions } from './chats.class.js'

export const chatPath = 'chats'
export const chatMethods = ['create']

export * from './chats.class.js'
export * from './chats.schema.js'
import { Readable } from 'node:stream'


// A configure function that registers the service and its hooks via `app.configure`
export const chat = (app) => {
  // Register our service on the Feathers application
  app.use(chatPath, new ChatService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: chatMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    koa: {
      after: [async (ctx, next) => {   
        if(typeof ctx.body[Symbol.asyncIterator] === 'function'){
          streamToSSE(ctx)
        }
        next();
      }]
    }
  })
 
  app.service(chatPath).hooks({
    around: {
      all: [
        schemaHooks.resolveResult(chatResolver)
      ]
    },
    before: {
      all: [
        authenticate('googleIAP','googleCLI'),
        authorizeHook,
        schemaHooks.validateQuery(chatQueryValidator), schemaHooks.resolveQuery(chatQueryResolver)
      ],
      create: [
        schemaHooks.validateData(chatDataValidator), schemaHooks.resolveData(chatDataResolver)
      ],
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}
