// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import { authorizeHook } from '../../auth/authorize.hook.js'
import { isProvider, isNot, iff } from 'feathers-hooks-common'
import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  chunkDataValidator,
  chunkPatchValidator,
  chunkQueryValidator,
  chunkResolver,
  chunkExternalResolver,
  chunkDataResolver,
  chunkPatchResolver,
  chunkQueryResolver,
  chunkVectorResolver
} from './chunks.schema.js'
import { ChunkService, getOptions } from './chunks.class.js'

export const chunkPath = 'chunks'
export const chunkMethods = ['find', 'get', 'create', 'patch', 'remove']

export * from './chunks.class.js'
export * from './chunks.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const chunk = (app) => {
  // Register our service on the Feathers application
  app.use(chunkPath, new ChunkService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: chunkMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(chunkPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(chunkExternalResolver),
        schemaHooks.resolveResult(chunkResolver)
      ]
    },
    before: {
      all: [
        authenticate('googleIAP'),
        iff(isNot(isProvider('internal')), authorizeHook),
        schemaHooks.validateQuery(chunkQueryValidator), 
        schemaHooks.resolveQuery(chunkQueryResolver)
      ],
      find: [
        schemaHooks.resolveQuery(chunkQueryResolver)
      ],
      get: [
        schemaHooks.resolveQuery(chunkQueryResolver)
      ],
      create: [
        schemaHooks.validateData(chunkDataValidator), 
        schemaHooks.resolveData(chunkDataResolver),
        schemaHooks.resolveData(chunkVectorResolver) // This inserts the embedding field
      ],
      patch: [
        schemaHooks.validateData(chunkPatchValidator), 
        schemaHooks.resolveData(chunkPatchResolver)
      ],
      remove: []
    },
    after: {
      all: []
    },
    error: {
      all: [],
      patch:[
        (ctx)=>{ // this cleans up the patch error when patching a pageContent to be a duplicate
          if(ctx?.error?.message?.indexOf('duplicate key value')>0){
            ctx.error.message = "Duplicate key value violates a unique constraint. Make sure pageContent is unique."
          }
        }
      ]
    }
  })
}
