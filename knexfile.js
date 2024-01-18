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
      port: '5432',
      user: 'unicorn_user', 
      password: 'magical_password',
      database: 'rainbow_database', 
    },
    debug:true,
    pool: { min: 0, max: 10, acquireTimeoutMillis: 60 * 1000 },

}

export default config
