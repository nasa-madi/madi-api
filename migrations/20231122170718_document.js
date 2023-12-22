export async function up(knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS vector;')
  await knex.schema.createTable('documents', (table) => {
    table.increments('id')
    table.string('title').notNullable(); // The title of the source
    table.string('type', 255).notNullable(); // Type of the source e.g., Article, Video, Journal, etc.
    table.text('description'); // A brief description of the source 
    table.specificType('embedding','vector') // a vector of all of the document fields

    table.string('author', 255).notNullable(); // The author of the source
    table.dateTime('publication_date'); // The date the source was published
  
    table.string('publisher', 255); // The publisher of the source
    table.string('publication_place', 255); // The place where the source was published
  
    table.text('url'); // The URL of the source if available online
    table.text('doi'); // The DOI (Digital Object Identifier) of the source if available
    table.string('url_hash').unique()

    table.text('access_date'); // Date the online source was accessed
    table.boolean('is_archived').defaultTo(false); // Whether the source has been archived
    table.text('archived_url'); // The URL of the archived version of the source
    table.string('website_name', 255); // The name of the website where the source was published
    table.string('website_domain', 255); // The domain of the website where the source was published
    table.timestamps(); // created_at and updated_at

    table.integer('user_id'); // not required
    table.integer('upload_ref'); // the id of the requisite upload blob file for fetching later
    table.integer('upload_hash'); // the hash of the upload to prevent duplication
  })
}

export async function down(knex) {
  await knex.schema.dropTable('documents')
}
