
// For more information about this file see https://dove.feathersjs.com/guides/cli/databases.html
import knex from 'knex'
import { toSql } from 'pgvector/knex';
// import mToPsql from 'mongo-query-to-postgres-jsonb'

// knex.QueryBuilder.extend('mongoQuery', function(column, value, arrayPaths){
//   let query = mToPsql(column, value, arrayPaths)
//   return this.client.raw(query)
// })

knex.QueryBuilder.extend('cosineDistanceAs', function(column, value, name) {
  return this.client.raw('?? <=> ? as ??', [column, toSql(value), name]);
});

export const postgresql = (app) => {
  const config = app.get('postgresql')
  const db = knex(config)

  app.set('postgresqlClient', db)
}