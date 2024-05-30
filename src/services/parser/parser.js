// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  parserDataValidator,
  parserPatchValidator,
  parserQueryValidator,
  parserResolver,
  parserExternalResolver,
  parserDataResolver,
  parserPatchResolver,
  parserQueryResolver
} from './parser.schema.js'
import { ParserService, getOptions } from './parser.class.js'

export const parserPath = 'parser'
export const parserMethods = ['create']

export * from './parser.class.js'
export * from './parser.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const parser = (app) => {
  // Register our service on the Feathers application
  app.use(parserPath, new ParserService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: parserMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(parserPath).hooks({
    around: {
      all: [schemaHooks.resolveExternal(parserExternalResolver), schemaHooks.resolveResult(parserResolver)]
    },
    before: {
      all: [schemaHooks.validateQuery(parserQueryValidator), schemaHooks.resolveQuery(parserQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(parserDataValidator), schemaHooks.resolveData(parserDataResolver)],
      patch: [schemaHooks.validateData(parserPatchValidator), schemaHooks.resolveData(parserPatchResolver)],
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
