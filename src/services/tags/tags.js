// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  tagsDataValidator,
  tagsPatchValidator,
  tagsQueryValidator,
  tagsResolver,
  tagsExternalResolver,
  tagsDataResolver,
  tagsPatchResolver,
  tagsQueryResolver
} from './tags.schema.js'
import { TagsService, getOptions } from './tags.class.js'
import { tagsPath, tagsMethods } from './tags.shared.js'

export * from './tags.class.js'
export * from './tags.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const tags = (app) => {
  // Register our service on the Feathers application
  app.use(tagsPath, new TagsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: tagsMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(tagsPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(tagsExternalResolver),
        schemaHooks.resolveResult(tagsResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(tagsQueryValidator), schemaHooks.resolveQuery(tagsQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(tagsDataValidator), schemaHooks.resolveData(tagsDataResolver)],
      patch: [schemaHooks.validateData(tagsPatchValidator), schemaHooks.resolveData(tagsPatchResolver)],
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
