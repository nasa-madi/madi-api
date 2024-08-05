import { authenticate } from '@feathersjs/authentication'
import { authorizeHook } from '../../auth/authorize.hook.js'
import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  uploadDataValidator,
  uploadPatchValidator,
  uploadQueryValidator,
  uploadResolver,
  uploadExternalResolver,
  uploadDataResolver,
  uploadPatchResolver,
  uploadQueryResolver,
  uploadResultResolver
} from './uploads.schema.js'
import { UploadService, getOptions } from './uploads.class.js'


export const uploadPath = 'uploads'
export const uploadMethods = ['find','get','create','remove']
export * from './uploads.class.js'
export * from './uploads.schema.js'


// A configure function that registers the service and its hooks via `app.configure`
export const upload = (app) => {
  // Register our service on the Feathers application
  app.use(uploadPath, new UploadService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: uploadMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(uploadPath).hooks({
    around: {
      all: [
        // schemaHooks.resolveExternal(uploadResultResolver)
      ]
    },
    before: {
      all: [
        // schemaHooks.validateQuery(uploadQueryValidator), 
        // schemaHooks.resolveQuery(uploadQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        // schemaHooks.validateData(uploadDataValidator),
        // schemaHooks.resolveData(uploadDataResolver)
      ],
      patch: [
        // schemaHooks.validateData(uploadPatchValidator), 
        // schemaHooks.resolveData(uploadPatchResolver)
      ],
      remove: []
    },
    after: {
      all: [
        
      ]
    },
    error: {
      all: []
    }
  })
}