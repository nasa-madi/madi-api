export async function up(knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS vector;')
  await knex.schema.createTable('uploads', (table) => {
      table.increments('id')
      table.string('userId').nullable();
      table.string('pluginId').nullable();
      table.string('fileId');
      table.string('filePath');
      table.string('filename');
      table.json('metadata').nullable();
      table.timestamps(); // created_at and updated_at
      table.specificType('embedding','vector') // a vector of all of the document fields
      table.unique(['filePath','filename', 'fileId']);
    })
    .catch(function (e) {
      console.error(e);
    });
}

export async function down(knex) {
  await knex.schema.dropTable('uploads')
}
