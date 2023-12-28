import { koa, rest } from '@feathersjs/koa'
import { feathers } from '@feathersjs/feathers'
import { logger } from './logger.js'
import mount from 'koa-mount'

import { app } from './app.js'

// const http = koa(feathers())

// http.use(mount('/api', app));
// console.log(process.env)

// const port = app.get('port')
// const host = app.get('host')

// process.on('unhandledRejection', (reason) => logger.error('Unhandled Rejection %O', reason))
// http.listen(port).then(() => {
//   logger.info(`Feathers app listening on http://${host}:${port}`)
// })


console.log(process.env)

const port = app.get('port')
const host = app.get('host')

process.on('unhandledRejection', (reason) => logger.error('Unhandled Rejection %O', reason))
app.listen(port).then(() => {
  logger.info(`Feathers app listening on http://${host}:${port}`)
})




