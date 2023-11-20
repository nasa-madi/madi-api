// For more information about this file see https://dove.feathersjs.com/guides/cli/databases.html
import knex from 'knex'

export const postgresql = (app) => {
  const config = app.get('postgresql')
  const db = knex(config)

  app.set('postgresqlClient', db)
}
