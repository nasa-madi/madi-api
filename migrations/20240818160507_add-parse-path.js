export async function up(knex) {
    // adds uploadPath field to the documents table
    await knex.schema.table('documents', (table) => {
        table.string('parsedPath')
    })
}
  
export async function down(knex) {
    // removes the uploadPath field from the documents table
    await knex.schema.table('documents', (table) => {
        table.dropColumn('parsedPath')
    })
}
  