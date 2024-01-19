/**
 * Run the migrations, adding the 'users' table to the database.
 *
 * @param {object} knex - The Knex.js query builder instance.
 * @returns {Promise<void>} A promise that resolves when the migration is completed.
 */
export async function up(knex) {
  await knex.schema.createTable('users', (table) => {
    table.increments('id');
    table.string('email').unique();
    table.string('googleId').unique();
    table.string('role');
  });
}

/**
 * Reverse the migrations, removing the 'users' table from the database.
 *
 * @param {object} knex - The Knex.js query builder instance.
 * @returns {Promise<void>} A promise that resolves when the migration is rolled back.
 */
export async function down(knex) {
  await knex.schema.dropTable('users');
}