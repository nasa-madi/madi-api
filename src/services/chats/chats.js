// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import { PassThrough } from 'stream';
import { hooks as schemaHooks } from '@feathersjs/schema'
import { logger } from '../../logger.js';
import { authorizeHook } from '../../auth/authorize.hook.js'

import {
  chatDataValidator,
  chatQueryValidator,
  chatResolver,
  chatExternalResolver,
  chatDataResolver,
  chatQueryResolver
} from './chats.schema.js'
import { ChatService, getOptions } from './chats.class.js'
import messageReducer from '../utils/deltaReducer.js';

export const chatPath = 'chats'
export const chatMethods = ['create']

export * from './chats.class.js'
export * from './chats.schema.js'

const ARTIFICIAL_DELAY_MS = 0;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
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
        if (typeof ctx.body[Symbol.asyncIterator] === 'function') {

          ctx.set({
            "Content-Type": "text/event-stream;",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
          });
          ctx.status = 200;
          
          ctx.res.flushHeaders()


          let chunkStream = ctx.body;

          ctx.body = new PassThrough();
          let message = {}

          let writeData = async () => {
              for await (let chunk of chunkStream) {
                  // console.log('RAW CHUNK',chunk)
                  message = messageReducer(message, chunk)
                  ctx.body.write(`data: ${JSON.stringify(chunk)}\n\n`);
                  await new Promise(resolve => setTimeout(resolve, ARTIFICIAL_DELAY_MS));
                  if(chunk?.choices?.[0]?.finish_reason){
                      ctx.body.write(`data: [DONE]\n\n`);
                      ctx.body.end();
                      return
                  }
              }
          };
          writeData()
          .then(()=>{
            logger.info(JSON.stringify(message))
          })
          next();
        }
      }]
    }
  })
 
  const iff = (condition, hook) =>async (context, next) => {
    const isCondition = typeof condition == 'function' ? condition(context) : !!condition;
    return isCondition ? hook(context, next) : next()
  }

        
  // Initialize hooks=
  app.service(chatPath).hooks({
    around: {
      all: [
        // authenticate('jwt'),
        iff(!app.get('openai').stream,schemaHooks.resolveExternal(chatExternalResolver)),
        iff(!app.get('openai').stream,schemaHooks.resolveResult(chatResolver)) 
      ]
    },
    before: {
      all: [
        authenticate('googleIAP'),
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
