import { ParserService, getOptions } from './parser.class.js'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { authorizeHook } from '../../auth/authorize.hook.js'
import { authenticate } from '@feathersjs/authentication'
import { parserQueryValidator, parserDataValidator } from './parser.schema.js'
import { softValidator } from '../../hooks/soft-validator.js'
import { unless  } from 'feathers-hooks-common'

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
      all: []
    },
    before: {
      all: [
        // authenticate('googleIAP','googleCLI'),
        // authorizeHook,
        schemaHooks.validateQuery(parserQueryValidator)
      ],
      find: [],
      get: [],
      create: [

        // TODO: Hard Validation Disabled until sufficient sample docs can be collected to confirm structure
        // See https://llmsherpa.readthedocs.io/en/latest/llmsherpa.html
        unless(
          c=>!!c.params.file, // Skip validation if file is present
          softValidator(parserDataValidator,{verbose:true})
        )

        // schemaHooks.validateData(parserDataValidator, { skipOnError: true })

      ],
      patch: [],
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