// For more information about this file see https://dove.feathersjs.com/guides/cli/authentication.html
import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication'
import { LocalStrategy } from '@feathersjs/authentication-local'


// class LocalPluginStrategy extends LocalStrategy {
//   async getEntityQuery(query, params) {
//     // Query for use but only include `active` users
//     return {
//       ...query,
//       active: true,
//       $limit: 1
//     }
//   }
// }

export const authentication = (app) => {
  const authentication = new AuthenticationService(app)

  authentication.register('jwt', new JWTStrategy())
  authentication.register('local', new LocalStrategy())

  app.use('authentication', authentication)
}
