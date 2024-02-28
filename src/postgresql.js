// For more information about this file see https://dove.feathersjs.com/guides/cli/databases.html
import knex from 'knex'

import { toSql } from 'pgvector/knex';

knex.QueryBuilder.extend('cosineDistanceAs', function(column, value, name) {
  return this.client.raw('?? <=> ? as ??', [column, toSql(value), name]);
});

export const postgresql = (app) => {
  // TODO: De-hackify this.  Required because Knex issue
  // https://github.com/node-config/node-config/issues/329
  // https://github.com/knex/knex/issues/5648
  let clone = JSON.parse(JSON.stringify(app.get('postgresql')))
  const db = knex(clone)
  app.set('postgresqlClient', db)
}
