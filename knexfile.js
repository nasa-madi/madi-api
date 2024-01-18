// For more information about this file see https://dove.feathersjs.com/guides/cli/databases.html
import { app } from './src/app.js'

// Load our database connection info from the app configuration
// let config = app.get('postgresql')
// console.log(config)
// console.log(app.get('file'))

let config = {
    client: 'pg',
    connection: {
      host: '10.43.177.3',
      port: 5432,
      user: 'postgres', 
      password: 'changeme',
      database: 'main', 
    },
    debug:true,
    pool: { min: 0, max: 30, acquireTimeoutMillis: 10 * 1000 },
}
console.log(config)

export default config
