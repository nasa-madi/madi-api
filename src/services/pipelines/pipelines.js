import { PipelinesService, getOptions } from './pipelines.class.js'
import { authenticate } from '@feathersjs/authentication'
import { authorizeHook } from '../../auth/authorize.hook.js'

export const pipelinesPathAndId = 'pipelines/:id'
export const pipelinesPath = 'pipelines'

export * from './pipelines.class.js'
export * from './pipelines.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const pipelines = (app) => {

  let hooks = {
    around: {
      all: [
        // authenticate('jwt'),
        // schemaHooks.resolveExternal(pipelinesExternalResolver),
        // schemaHooks.resolveResult(pipelinesResolver)
      ]
    },
    before: {
      all: [
        authenticate('googleIAP','googleCLI'),
        authorizeHook
        // schemaHooks.validateQuery(pipelinesQueryValidator),
        // schemaHooks.resolveQuery(pipelinesQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        // schemaHooks.validateData(pipelinesDataValidator),
        // schemaHooks.resolveData(pipelinesDataResolver)
      ],
      patch: [
        // schemaHooks.validateData(pipelinesPatchValidator),
        // schemaHooks.resolveData(pipelinesPatchResolver)
      ],
      remove: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  }
  
  // Register our service on the Feathers application
  app.use(pipelinesPathAndId, new PipelinesService(getOptions(app)), {methods: ['find','create'], events: []})
  app.use(pipelinesPath,      new PipelinesService(getOptions(app)), {methods: ['find'], events: []})

  // Initialize hooks
  app.service(pipelinesPath).hooks(hooks)
  app.service(pipelinesPathAndId).hooks(hooks)

}
