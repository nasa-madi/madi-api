/**
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
export const seed = async function(knex) {
  // Deletes ALL existing entries
  // await knex('users').del();
  console.log("info: Running the Admin Seed.")

  const sequenceValue = await knex.raw("SELECT last_value FROM users_id_seq");
  if (sequenceValue.rows[0].last_value < 4) {
    await knex.raw('ALTER SEQUENCE users_id_seq RESTART WITH 4');
  }

  await knex('users').insert([
    { id: 1, email: 'superadmin@example.com', googleId: '00000000', role: 'superadmin' },
    { id: 2, email: 'admin@example.com',      googleId: '11111111', role: 'admin' },
    { id: 3, email: 'member@example.com',     googleId: '22222222', role: 'member' }
  ]).onConflict('id').merge();

};