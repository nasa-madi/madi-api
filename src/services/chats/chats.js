// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import { PassThrough } from 'stream';
import { hooks as schemaHooks } from '@feathersjs/schema'
import { Transform } from 'stream'

import {
  chatDataValidator,
  chatQueryValidator,
  chatResolver,
  chatExternalResolver,
  chatDataResolver,
  chatQueryResolver
} from './chats.schema.js'
import { ChatService, getOptions } from './chats.class.js'

export const chatPath = 'chats'
export const chatMethods = ['create']

export * from './chats.class.js'
export * from './chats.schema.js'

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
        ctx.request.socket.setTimeout(0);
        ctx.req.socket.setNoDelay(true);
        ctx.req.socket.setKeepAlive(true);
    
        ctx.set({
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        });
    
        const stream = new PassThrough();
    
        ctx.status = 200;
        ctx.body = stream;
    
        let counter = 0
        const interval = setInterval(() => {
            console.log('counter', counter)
            counter++;
            if(counter > 20){
              clearInterval(interval)
            }
            stream.write(`data: ${new Date()}\n\n`);
          }, 1000);
          
        stream.on("close", () => {
            clearInterval(interval);
        });
      }]
    }
  })
  // Initialize hooks=
  app.service(chatPath).hooks({
    around: {
      all: [
        // authenticate('jwt'),
        // schemaHooks.resolveExternal(chatExternalResolver),
        // schemaHooks.resolveResult(chatResolver)
      ]
    },
    before: {
      all: [
        // schemaHooks.validateQuery(chatQueryValidator), schemaHooks.resolveQuery(chatQueryResolver)
      ],
      create: [
        // schemaHooks.validateData(chatDataValidator), schemaHooks.resolveData(chatDataResolver)
      ],
    },
    after: {
      all: [
        (ctx,a,b)=>{
          console.log('in the hook')
        }
      ]
    },
    error: {
      all: []
    }
  })
}
