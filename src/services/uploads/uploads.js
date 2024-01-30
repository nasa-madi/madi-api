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
  uploadQueryResolver
} from './uploads.schema.js'
import { UploadService, getOptions } from './uploads.class.js'


export const uploadPath = 'uploads'
// export const uploadMethods = ['find', 'get', 'create', 'patch', 'remove']
export const uploadMethods = ['find','create']
export * from './uploads.class.js'
export * from './uploads.schema.js'
import multer from '@koa/multer';
const multipartMulter = multer({ storage: multer.memoryStorage() }); // Use memory storage for file uploads






// A configure function that registers the service and its hooks via `app.configure`
export const upload = (app) => {
  // Register our service on the Feathers application
  app.use(uploadPath, new UploadService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: uploadMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    koa:{
      before:[
        multipartMulter.single('file'), 
        async function(ctx, next){
          ctx.feathers.file = ctx.file
          ctx.request.body = Object.assign({},{
            metadata:ctx.request.body
          })
          next()
        }
      ]
    }
  })
  // Initialize hooks
  app.service(uploadPath).hooks({
    around: {
      all: []
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
      all: []
    },
    error: {
      all: []
    }
  })
}
