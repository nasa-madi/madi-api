// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html
import { feathers } from '@feathersjs/feathers'
import configuration from '@feathersjs/configuration'
import { koa, rest, bodyParser, errorHandler, parseAuthentication, cors, serveStatic } from '@feathersjs/koa'
import { feathersCasl } from "feathers-casl";
import { iff, isProvider } from 'feathers-hooks-common'

import { configurationValidator } from './configuration.js'
import { logError, logErrorExternal } from './hooks/log-error.js'
import { automigrate, autoseed, postgresql } from './postgresql.js'

import { authentication, registerSuperAdmins } from './auth/authentication.js'
import { services } from './services/index.js'
import koaQs from 'koa-qs' //override koa's default query string function to allow nested fields
import { decoder } from './services/utils/numericDecoder.js';
import { plugins } from './plugins.js'
import parseRpcVerb from 'feathers-rpc'
import { logger } from './logger.js'






const app = koaQs(koa(feathers()),'extended',{ decoder }) 

import { openaiConfig } from './services/utils/cacheProxy.js'


// Load our app configuration (see config/ folder)
app.configure(configuration(configurationValidator))

logger.info(`CONFIGURATION: ${app.get('file')}`)

// Set up Koa middleware
app.use(cors())
app.use(serveStatic('specifications/build'))
app.use(errorHandler())
app.use(parseAuthentication())
app.use(bodyParser({
  jsonLimit: '10mb'
}));
app.configure(openaiConfig)



// Configure services and transports
app.use(parseRpcVerb());                         

app.configure(rest())

app.configure(postgresql)

app.configure(services)

app.configure(authentication)

app.configure(feathersCasl());

// app.configure(plugins);

// Register hooks that run on all service methods
app.hooks({
  around: {
    all: [
      logError,
    ]
  },
  before: {},
  after: {},
  error: {
    all:[
      iff(isProvider('external'),logErrorExternal)
    ]
  }
})

// Register application setup and teardown hooks here
app.hooks({
  setup: [
    automigrate,
    autoseed,
    registerSuperAdmins,
  ],
  teardown: [],
})

export { app }
