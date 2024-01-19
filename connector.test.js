
import knexLib from 'knex';

const knex = knexLib({
  client: 'pg',
  connection: {
    host: '/cloudsql/hq-madi-dev-4ebd7d92:us-east4:postgres-hq-madi-dev-4ebd7d92-28e2',
    user: 'postgres',
    password: 'changeme',
    database: 'main',
    port:5432
  },
  pool: {
    min: 0,
    max: 7,
    afterCreate: (conn, done) => {
      conn.query('SET timezone="UTC";', (err) => {
        if (err) {
          console.log(err);
        }
        done(err, conn);
      });
    }
  }
});

knex.raw('select 1+1 as result')
  .then(() => {
    console.log('Database connection established');
  })
  .catch((error) => {
    console.error('Database connection error:', error);
  });