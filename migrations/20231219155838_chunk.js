export async function up(knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS vector;')
  await knex.schema.createTable('chunks', (table) => {
    table.increments('id')
    table.string('hash').unique()
    table.jsonb('metadata')
    table.text('pageContent')
    table.integer('documentId')
    table.integer('documentIndex')
    table.text('toolName')
    table.text('userId')
    table.specificType('embedding','vector(1536)')
    table.index(knex.raw('embedding vector_cosine_ops'), 'chunks_embedding_index', 'hnsw');
  })
}

export async function down(knex) {
  await knex.schema.dropTable('chunks')
}
