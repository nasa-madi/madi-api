// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

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
export const uploadMethods = ['find', 'get', 'create', 'patch', 'remove']

export * from './uploads.class.js'
export * from './uploads.schema.js'


import multer from 'multer'
import BlobService from 'feathers-blob'
import fs from 'fs-blob-store'

const blobStorage = fs('./uploads');
const multipartMiddleware = multer();



// A configure function that registers the service and its hooks via `app.configure`
export const upload = (app) => {
  // Register our service on the Feathers application
  app.use(uploadPath, 
  
    // // multer parses the file named 'uri'.
    // // Without extra params the data is
    // // temporarely kept in memory
    // multipartMiddleware.single('uri'),

    // // another middleware, this time to
    // // transfer the received file to feathers
    // function(req,res,next){
    //     req.feathers.file = req.file;
    //     next();
    // },
    // BlobService({Model: blobStorage}),
    new UploadService(getOptions(app)), 
    {
      // A list of all methods this service exposes externally
      methods: uploadMethods,
      // You can add additional custom events to be sent to clients here
      events: []
  })
  // Initialize hooks
  app.service(uploadPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(uploadExternalResolver),
        schemaHooks.resolveResult(uploadResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(uploadQueryValidator), schemaHooks.resolveQuery(uploadQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(uploadDataValidator), schemaHooks.resolveData(uploadDataResolver)],
      patch: [schemaHooks.validateData(uploadPatchValidator), schemaHooks.resolveData(uploadPatchResolver)],
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
