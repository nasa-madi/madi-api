// // For more information about this file see https://dove.feathersjs.com/guides/cli/databases.html
// import Config from '@feathersjs/configuration'
// let config = Config()()

// // Load our database connection info from the app configuration
// let knexConfig = config.util.cloneDeep(config.get('postgresql'));
// export default knexConfig


// For more information about this file see https://dove.feathersjs.com/guides/cli/databases.html
import { app } from './src/app.js'

// Load our database connection info from the app configuration
const config = app.get('postgresql')

export default config

