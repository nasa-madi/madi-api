// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  documentsDataValidator,
  documentsPatchValidator,
  documentsQueryValidator,
  documentsResolver,
  documentsExternalResolver,
  documentsDataResolver,
  documentsPatchResolver,
  documentsQueryResolver
} from './documents.schema.js'
import { DocumentsService, getOptions } from './documents.class.js'
import { documentsPath, documentsMethods } from './documents.shared.js'

export * from './documents.class.js'
export * from './documents.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const documents = (app) => {
  // Register our service on the Feathers application
  app.use(documentsPath, new DocumentsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: documentsMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(documentsPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(documentsExternalResolver),
        schemaHooks.resolveResult(documentsResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(documentsQueryValidator),
        schemaHooks.resolveQuery(documentsQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(documentsDataValidator),
        schemaHooks.resolveData(documentsDataResolver)
      ],
      patch: [
        schemaHooks.validateData(documentsPatchValidator),
        schemaHooks.resolveData(documentsPatchResolver)
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
