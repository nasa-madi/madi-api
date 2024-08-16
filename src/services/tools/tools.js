// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { authorizeHook } from '../../auth/authorize.hook.js'

import {
  toolDataValidator,
  // toolPatchValidator,
  toolQueryValidator,
  toolResolver,
  toolExternalResolver,
  toolDataResolver,
  // toolPatchResolver,
  toolQueryResolver
} from './tools.schema.js'
import { ToolService, getOptions } from './tools.class.js'

export const toolPath = 'tools'
export const toolMethods = ['find', 'get', 'create','refreshData']


export * from './tools.class.js'
export * from './tools.schema.js'

// const { user } = context.result;
// if (!user) return context;
// const ability = defineAbilitiesFor(user);
// context.result.ability = ability;
// context.result.rules = ability.rules;

// return context;


// A configure function that registers the service and its hooks via `app.configure`
export const tool = (app) => {
  // Register our service on the Feathers application
  app.use(toolPath, new ToolService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: toolMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(toolPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(toolExternalResolver),
        schemaHooks.resolveResult(toolResolver),
        
      ]
    },
    before: {
      all: [
        authenticate('googleIAP','googleCLI'),
        authorizeHook,
        schemaHooks.validateQuery(toolQueryValidator), 
        schemaHooks.resolveQuery(toolQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(toolDataValidator), 
        schemaHooks.resolveData(toolDataResolver)
      ],
      patch: [],
      remove: []
    },
    after: {
      all: [authorizeHook]
    },
    error: {
      all: []
    }
  })
}
