export async function up(knex) {
    // removes the uploadId field from the documents table
    await knex.schema.table('documents', (table) => {
        table.dropColumn('uploadId')
    })

    // adds uploadPath field to the documents table
    await knex.schema.table('documents', (table) => {
        table.string('uploadPath')
    })

  }
  
export async function down(knex) {
    // removes the uploadPath field from the documents table
    await knex.schema.table('documents', (table) => {
        table.dropColumn('uploadPath')
    })

    // adds uploadId field to the documents table
    await knex.schema.table('documents', (table) => {
        table.string('uploadId')
    })
}
  