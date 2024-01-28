// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  blobDataValidator,
  blobPatchValidator,
  blobQueryValidator,
  blobResolver,
  blobExternalResolver,
  blobDataResolver,
  blobPatchResolver,
  blobQueryResolver
} from './blobs.schema.js'
import { BlobService, getOptions } from './blobs.class.js'
import { disallow } from 'feathers-hooks-common'
export const blobPath = 'blobs'
export const blobMethods = ['find', 'get', 'create', 'remove']

export * from './blobs.class.js'
export * from './blobs.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const blob = (app) => {
  // Register our service on the Feathers application
  app.use(blobPath, new BlobService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: blobMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(blobPath).hooks({
    around: {
      all: [
        disallow('external'),
        schemaHooks.resolveResult(blobResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(blobQueryValidator), 
        schemaHooks.resolveQuery(blobQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(blobDataValidator), 
        schemaHooks.resolveData(blobDataResolver)
      ],
      patch: [
        schemaHooks.validateData(blobPatchValidator), 
        schemaHooks.resolveData(blobPatchResolver)
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
