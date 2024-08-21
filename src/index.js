import { logger } from './logger.js'
import { app } from './app.js'

logger.info('CONFIGURATION: ' + JSON.stringify({
  'user': process.env.USER,
  'pid': process.pid,
  'node_env_config': process.env.NODE_ENV_CONFIG,
  'node_env': process.env.NODE_ENV
}))

const port = app.get('port')
const host = app.get('host')

process.on('unhandledRejection', (reason) => logger.error('Unhandled Rejection %O', reason))
app.listen(port).then(() => {
  logger.info(`CONFIGURATION: Feathers app listening on http://${host}:${port}`)
})


