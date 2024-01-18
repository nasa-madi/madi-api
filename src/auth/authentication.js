// For more information about this file see https://dove.feathersjs.com/guides/cli/authentication.html
import { AuthenticationService } from '@feathersjs/authentication'
import { GoogleIAPStrategy } from './googleIAP.strategy.js';


export const authentication = (app) => {
  const authentication = new AuthenticationService(app)

  authentication.register('googleIAP', new GoogleIAPStrategy());

  app.use('authentication', authentication)
}
