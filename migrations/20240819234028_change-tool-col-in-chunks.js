export async function up(knex) {
    // Rename the toolName column to plugin
    await knex.schema.table('chunks', (table) => {
        table.renameColumn('toolName', 'plugin');
    });

    // Recast the userId column as an integer
    await knex.schema.alterTable('chunks', (table) => {
        table.integer('userId').alter();
    });
}

export async function down(knex) {
    // Recast the userId column back to its original type (assuming it was a string)
    await knex.schema.alterTable('chunks', (table) => {
        table.string('userId').alter();
    });

    // Rename the plugin column back to toolName
    await knex.schema.table('chunks', (table) => {
        table.renameColumn('plugin', 'toolName');
    });
}