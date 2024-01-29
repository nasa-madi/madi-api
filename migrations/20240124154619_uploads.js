export async function up(knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS vector;')
  await knex.schema.createTable('uploads', (table) => {
      table.string('id').primary();
      table.string('userId');
      table.string('pluginId').nullable();
      table.string('fileId');
      table.string('filename');
      table.json('metadata');
      table.timestamps(); // created_at and updated_at
      table.string('hash');
      table.specificType('embedding','vector') // a vector of all of the document fields
    })
    .catch(function (e) {
      console.error(e);
    });
}

export async function down(knex) {
  await knex.schema.dropTable('uploads')
}
