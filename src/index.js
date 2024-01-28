import { logger } from './logger.js'

import { app } from './app.js'

console.log(process.env)

const port = app.get('port')
const host = app.get('host')

process.on('unhandledRejection', (reason) => logger.error('Unhandled Rejection %O', reason))
app.listen(port).then(() => {
  logger.info(`Feathers app listening on http://${host}:${port}`)
})




