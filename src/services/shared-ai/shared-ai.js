// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import { disallow } from 'feathers-hooks-common'

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  sharedAiDataValidator,
  sharedAiPatchValidator,
  sharedAiQueryValidator,
  sharedAiResolver,
  sharedAiExternalResolver,
  sharedAiDataResolver,
  sharedAiPatchResolver,
  sharedAiQueryResolver
} from './shared-ai.schema.js'
import { SharedAiService, getOptions } from './shared-ai.class.js'

export const sharedAiPath = 'shared-ai'
export const sharedAiMethods = ['find', 'get', 'create', 'patch', 'remove']

export * from './shared-ai.class.js'
export * from './shared-ai.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const sharedAi = (app) => {
  // Register our service on the Feathers application
  app.use(sharedAiPath, new SharedAiService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: sharedAiMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(sharedAiPath).hooks({
    around: {
      all: [
        disallow('external'),
        schemaHooks.resolveExternal(sharedAiExternalResolver),
        schemaHooks.resolveResult(sharedAiResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(sharedAiQueryValidator),
        schemaHooks.resolveQuery(sharedAiQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(sharedAiDataValidator),
        schemaHooks.resolveData(sharedAiDataResolver)
      ],
      patch: [
        schemaHooks.validateData(sharedAiPatchValidator),
        schemaHooks.resolveData(sharedAiPatchResolver)
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
