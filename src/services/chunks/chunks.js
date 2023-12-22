// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  chunksDataValidator,
  chunksPatchValidator,
  chunksQueryValidator,
  chunksResolver,
  chunksExternalResolver,
  chunksDataResolver,
  chunksPatchResolver,
  chunksQueryResolver,
  chunksVectorResolver
} from './chunks.schema.js'
import { ChunksService, getOptions } from './chunks.class.js'

export const chunksPath = 'chunks'
export const chunksMethods = ['find', 'get', 'create', 'patch', 'remove']

export * from './chunks.class.js'
export * from './chunks.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const chunks = (app) => {
  // Register our service on the Feathers application
  app.use(chunksPath, new ChunksService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: chunksMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(chunksPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(chunksExternalResolver),
        schemaHooks.resolveResult(chunksResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(chunksQueryValidator), schemaHooks.resolveQuery(chunksQueryResolver)],
      find: [schemaHooks.resolveQuery(chunksQueryResolver)],
      get: [],
      create: [
        schemaHooks.validateData(chunksDataValidator), 
        schemaHooks.resolveData(chunksDataResolver),
        schemaHooks.resolveData(chunksVectorResolver) // This inserts the embedding field
      ],
      patch: [schemaHooks.validateData(chunksPatchValidator), schemaHooks.resolveData(chunksPatchResolver)],
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
