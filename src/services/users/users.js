// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import { toolDescs } from '../../plugins.js'
import { hooks as schemaHooks } from '@feathersjs/schema'
import { authorizeHook } from '../../auth/authorize.hook.js'
import { iff, iffElse } from 'feathers-hooks-common';
import {
  userDataValidator,
  userPatchValidator,
  userQueryValidator,
  userResolver,
  userExternalResolver,
  userDataResolver,
  userPatchResolver,
  userQueryResolver
} from './users.schema.js'
import { UserService, getOptions } from './users.class.js'

export const userPath = 'users'
export const userMethods = ['find', 'get', 'create', 'patch', 'remove']

export * from './users.class.js'
export * from './users.schema.js'


// const iff = (condition, hook) =>async (context, next) => {
//   const isCondition = typeof condition == 'function' ? condition(context) : !!condition;
//   return isCondition ? hook(context, next) : next()
// }


// A configure function that registers the service and its hooks via `app.configure`
export const user = (app) => {
  // Register our service on the Feathers application
  app.use(userPath, new UserService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: userMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(userPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(userExternalResolver), 
        schemaHooks.resolveResult(userResolver)
      ],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: []
    },
    before: {
      all: [
        schemaHooks.validateQuery(userQueryValidator), 
        schemaHooks.resolveQuery(userQueryResolver)
      ],
      find: [
        authenticate('googleIAP','googleCLI'),
        authorizeHook,
      ],
      get: [
        authenticate('googleIAP','googleCLI'),
        authorizeHook,
      ],
      create: [
        (context)=>context.params.returnAuthBool=true,
        // (context)=>{console.log('user create', context)},
        authenticate('googleIAP','googleCLI'),
        iffElse((context)=>!!context.params.user,
          [authorizeHook],[
            (context)=>{
              // console.log('iffElse BEFORE', context.params, context.data)
              //update modify the create to be inputs from authentication
              context.data = {
                email:context.params.authentication.googleIAPEmail,
                googleId: context.params.authentication.googleIAPUserId,
                role:'member'
              }
              // console.log('iffElse AFTER', context.data)
            }
          ]
        ),
        schemaHooks.validateData(userDataValidator), 
        schemaHooks.resolveData(userDataResolver)
      ],
      patch: [
        authenticate('googleIAP','googleCLI'),
        authorizeHook,
        schemaHooks.validateData(userPatchValidator),
        schemaHooks.resolveData(userPatchResolver)
      ],
      remove: [
        authenticate('googleIAP','googleCLI'),
        authorizeHook
      ]
    },
    after: {
      all: [],
      get: [(ctx)=>{
        //adds plugins
        // console.log(ctx)
        ctx.result = {
          ...ctx.result,
          tools: Object.keys(toolDescs)
        }
      }]
    },
    error: {
      all: []
    }
  })
}
