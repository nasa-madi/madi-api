import { koa, rest } from '@feathersjs/koa'
import { feathers } from '@feathersjs/feathers'
import { logger } from './logger.js'
import { app } from './app.js'
import config from 'config'

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
console.log(config)

const port = app.get('port')
const host = app.get('host')

process.on('unhandledRejection', (reason) => logger.error('Unhandled Rejection %O', reason))
app.listen(port).then(() => {
  logger.info(`Feathers app listening on http://${host}:${port}`)
})




