import { UploadService, getOptions } from './uploads.class.js'
import { gcs } from './providers/gcs.provider.js'
import { authenticate } from '@feathersjs/authentication'
import { authorizeHook } from '../../auth/authorize.hook.js'

export const uploadPath = 'uploads'
export const uploadMethods = ['find','get','create','remove']
export * from './uploads.class.js'
export * from './uploads.schema.js'





// A configure function that registers the service and its hooks via `app.configure`
export const upload= (app) => {
  // add the additional provider services
  app.configure(gcs)

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
        authenticate('googleIAP','googleCLI'),
        authorizeHook,
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