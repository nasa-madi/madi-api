// For more information about this file see https://dove.feathersjs.com/guides/cli/authentication.html
import { AuthenticationService } from '@feathersjs/authentication'
import { GoogleIAPStrategy } from './googleIAP.strategy.js';

export const authentication = async (app) => {
  const authentication = new AuthenticationService(app)

  authentication.register('googleIAP', new GoogleIAPStrategy());

  app.use('authentication', authentication)
  let knex = app.get('postgresqlClient')

  // This code should set the superadmin credentials of the emails listed in the config files
  let { superadmin } = app.get('authentication');
  superadmin = superadmin || []
  for (const email of superadmin) {
    await knex('users')
      .where({ email })
      .update({ role: 'superadmin' });
  }
}
