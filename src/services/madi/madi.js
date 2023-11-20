// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  madiDataValidator,
  madiPatchValidator,
  madiQueryValidator,
  madiResolver,
  madiExternalResolver,
  madiDataResolver,
  madiPatchResolver,
  madiQueryResolver
} from './madi.schema.js'
import { MadiService, getOptions } from './madi.class.js'
import { madiPath, madiMethods } from './madi.shared.js'

export * from './madi.class.js'
export * from './madi.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const madi = (app) => {
  // Register our service on the Feathers application
  app.use(madiPath, new MadiService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: madiMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(madiPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(madiExternalResolver),
        schemaHooks.resolveResult(madiResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(madiQueryValidator), schemaHooks.resolveQuery(madiQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(madiDataValidator), schemaHooks.resolveData(madiDataResolver)],
      patch: [schemaHooks.validateData(madiPatchValidator), schemaHooks.resolveData(madiPatchResolver)],
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
