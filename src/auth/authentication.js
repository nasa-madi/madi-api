// For more information about this file see https://dove.feathersjs.com/guides/cli/authentication.html
import { AuthenticationService } from '@feathersjs/authentication'
import { GoogleIAPStrategy } from './googleIAP.strategy.js';
import { GoogleCLIStrategy } from './googleCLI.strategy.js';

export const authentication = async (app) => {
  const authentication = new AuthenticationService(app)

  authentication.register('googleIAP', new GoogleIAPStrategy());
  authentication.register('googleCLI', new GoogleCLIStrategy());


  app.use('authentication', authentication)
}

// This code should set the superadmin credentials of the emails listed in the config files
export const registerSuperAdmins = async ({app}, next) => {
  let { superadmin } = app.get('authentication');
  let knex = app.get('postgresqlClient')
  superadmin = superadmin || []
  for (const email of superadmin) {
    await knex('users')
      .where({ email })
      .update({ role: 'superadmin' });
  }
  await next()
}