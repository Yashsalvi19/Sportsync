const { Client } = require('pg');
const client = new Client({
  connectionString: 'jdbc:postgresql://aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?prepareThreshold=0'.replace('jdbc:postgresql://', 'postgresql://')
});

async function run() {
  await client.connect();
  const users = await client.query('SELECT id, email, role_id FROM users');
  console.log("Users:", users.rows);
  const coaches = await client.query('SELECT * FROM coach');
  console.log("Coaches:", coaches.rows);
  const students = await client.query('SELECT * FROM student');
  console.log("Students:", students.rows);
  await client.end();
}
run().catch(console.error);
