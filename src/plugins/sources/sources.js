// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  sourcesDataValidator,
  sourcesPatchValidator,
  sourcesQueryValidator,
  sourcesResolver,
  sourcesExternalResolver,
  sourcesDataResolver,
  sourcesPatchResolver,
  sourcesQueryResolver
} from './sources.schema.js'
import { SourcesService, getOptions } from './sources.class.js'
import { sourcesPath, sourcesMethods } from './sources.shared.js'

export * from './sources.class.js'
export * from './sources.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const sources = (app) => {
  // Register our service on the Feathers application
  app.use(sourcesPath, new SourcesService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: sourcesMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(sourcesPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(sourcesExternalResolver),
        schemaHooks.resolveResult(sourcesResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(sourcesQueryValidator), schemaHooks.resolveQuery(sourcesQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(sourcesDataValidator), schemaHooks.resolveData(sourcesDataResolver)],
      patch: [schemaHooks.validateData(sourcesPatchValidator), schemaHooks.resolveData(sourcesPatchResolver)],
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
