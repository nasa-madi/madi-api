// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  uploadsDataValidator,
  uploadsPatchValidator,
  uploadsQueryValidator,
  uploadsResolver,
  uploadsExternalResolver,
  uploadsDataResolver,
  uploadsPatchResolver,
  uploadsQueryResolver
} from './uploads.schema.js'
import { uploadsPath, uploadsMethods } from './uploads.shared.js'

import multer from 'multer'
import BlobService from 'feathers-blob'
import fs from 'fs-blob-store'




const blobStorage = fs('./uploads');
const multipartMiddleware = multer();


export * from './uploads.class.js'
export * from './uploads.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const uploads = (app) => {
  // Register our service on the Feathers application
  app.use(uploadsPath, 
    
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
    BlobService({Model: blobStorage}),
    // new UploadsService(getOptions(app)), 
  
    
    {
      // A list of all methods this service exposes externally
      methods: uploadsMethods,
      // You can add additional custom events to be sent to clients here
      events: []
    }
  )
  // Initialize hooks
  app.service(uploadsPath).hooks({
    around: {
      all: [
        // authenticate('jwt'),
        // schemaHooks.resolveExternal(uploadsExternalResolver),
        // schemaHooks.resolveResult(uploadsResolver)
      ]
    },
    before: {
      // all: [schemaHooks.validateQuery(uploadsQueryValidator), schemaHooks.resolveQuery(uploadsQueryResolver)],
      // find: [],
      // get: [],
      // create: [schemaHooks.validateData(uploadsDataValidator), schemaHooks.resolveData(uploadsDataResolver)],
      // patch: [schemaHooks.validateData(uploadsPatchValidator), schemaHooks.resolveData(uploadsPatchResolver)],
      // remove: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}
