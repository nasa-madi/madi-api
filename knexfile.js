// For more information about this file see https://dove.feathersjs.com/guides/cli/databases.html
import { app } from './src/app.js'

// Load our database connection info from the app configuration
let config = app.get('postgresql')
console.log(config)
console.log(app.get('file'))
export default config
