
// For more information about this file see https://dove.feathersjs.com/guides/cli/databases.html
import knex from 'knex'
import { toSql } from 'pgvector/knex';
import { logger } from './logger.js'
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


export const automigrate = async (app) => {
  logger.info('AUTOMIGRATE: Automigrating database')
  const config = app.get('postgresql')
  
  const db = knex(config)
  // knex.migrate.list([config])
  let list = await db.migrate.list()
  if(list.length < 3 && config.automigrate){
    await knex.migrate.latest()
    logger.info('AUTOMIGRATE: Migrations complete')

  }else{
    logger.info('AUTOMIGRATE: Migrations skipped')
  }
}

export const autoseed = async (app) => {
  const config = app.get('postgresql')

  if(config.autoseed){
    logger.info('AUTOSEED: Automigrating database')  
    const db = knex(config)
    // knex.migrate.list([config])
    let list = await db.migrate.list()
    if(list.length < 3 && config.automigrate){
      await knex.seed.run()
      logger.info('AUTOSEED: Seeding complete')
    }else{
      logger.info('AUTOSEED: Seeding skipped')
    }
  }
}