// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'


import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  documentDataValidator,
  documentPatchValidator,
  documentQueryValidator,
  documentResolver,
  documentExternalResolver,
  documentDataResolver,
  documentPatchResolver,
  documentQueryResolver,
  documentVectorResolver
} from './documents.schema.js'

import { DocumentService, getOptions } from './documents.class.js'

export const documentPath = 'documents'
export const documentMethods = ['find', 'get', 'create', 'patch', 'remove']

export * from './documents.class.js'
export * from './documents.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const document = (app) => {
  // Register our service on the Feathers application
  app.use(documentPath, new DocumentService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: documentMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(documentPath).hooks({
    around: {
      all: [
        // authenticate('jwt'),
        schemaHooks.resolveExternal(documentExternalResolver),
        schemaHooks.resolveResult(documentResolver),
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(documentQueryValidator),
        schemaHooks.resolveQuery(documentQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(documentDataValidator),
        schemaHooks.resolveData(documentDataResolver),
        // must be after the main doc resolver
        schemaHooks.resolveData(documentVectorResolver)
      ],
      patch: [
        schemaHooks.validateData(documentPatchValidator),
        schemaHooks.resolveData(documentPatchResolver)
      ],
      remove: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}
