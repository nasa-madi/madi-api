
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

export const postgresql = async (app) => {
  const config = app.get('postgresql')
  const db = knex(config)
  app.set('postgresqlClient', db)

  await automigrate(app)
  await autoseed(app)

}


export const automigrate = async (app) => {
  const config = app.get('postgresql')
  if(config.automigrate){
    logger.info('MIGRATE: Automigrating database')
    const db = knex(config)
    let list = await db.migrate.list()
    if(list[0].length < 3){
      await db.migrate.latest()
      logger.info('MIGRATE: Migrations complete')
  
    }else{
      logger.info('MIGRATE: Migrations skipped')
    }
  }
}

export const autoseed = async (app) => {
  const config = app.get('postgresql')

  if(config.autoseed){
    logger.info('SEED: Autoseeding database')  
    const db = knex(config)
    let users = await db('users').select()
    if(users.length < 3){
      await db.seed.run()
      logger.info('SEED: Autoseeding complete')
    }else{
      logger.info('SEED: Autoseeding skipped')
    }
  }
}