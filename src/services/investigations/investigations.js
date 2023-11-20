// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  investigationsDataValidator,
  investigationsPatchValidator,
  investigationsQueryValidator,
  investigationsResolver,
  investigationsExternalResolver,
  investigationsDataResolver,
  investigationsPatchResolver,
  investigationsQueryResolver
} from './investigations.schema.js'
import { InvestigationsService, getOptions } from './investigations.class.js'
import { investigationsPath, investigationsMethods } from './investigations.shared.js'

export * from './investigations.class.js'
export * from './investigations.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const investigations = (app) => {
  // Register our service on the Feathers application
  app.use(investigationsPath, new InvestigationsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: investigationsMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(investigationsPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(investigationsExternalResolver),
        schemaHooks.resolveResult(investigationsResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(investigationsQueryValidator),
        schemaHooks.resolveQuery(investigationsQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(investigationsDataValidator),
        schemaHooks.resolveData(investigationsDataResolver)
      ],
      patch: [
        schemaHooks.validateData(investigationsPatchValidator),
        schemaHooks.resolveData(investigationsPatchResolver)
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
