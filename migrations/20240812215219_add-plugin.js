export async function up(knex) {
    // removes the uploadId field from the documents table
    await knex.schema.table('documents', (table) => {
        table.renameColumn('toolName', 'plugin');
    })

  }
  
export async function down(knex) {
    await knex.schema.table('documents', (table) => {
        table.renameColumn( 'plugin', 'toolName');
    })
}
  