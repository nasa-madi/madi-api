export async function up(knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS vector;')
  await knex.schema.dropTableIfExists('documents');
  await knex.schema.createTable('documents', (table) => {
    table.increments('id')
    table.string('hash').unique()
    table.jsonb('metadata')
    table.text('content');
    table.integer('uploadId');
    table.text('abstract');
    table.string('toolName');
    table.integer('userId');
  })
}

export async function down(knex) {
  await knex.schema.dropTable('documents')
}
