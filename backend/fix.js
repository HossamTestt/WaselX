const bcrypt = require('bcryptjs');
const { Client } = require('pg');

async function fix() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'waselx_db',
    password: 'Hossam!@#45',
    port: 5432
  });
  
  await client.connect();
  
  const adminHash = await bcrypt.hash('Admin@WaselX2024', 12);
  const testHash = await bcrypt.hash('Test@1234', 12);
  
  await client.query("UPDATE users SET password_hash = $1 WHERE email = 'admin@waselx.com'", [adminHash]);
  await client.query("UPDATE users SET password_hash = $1 WHERE email = 'shipper@test.com'", [testHash]);
  await client.query("UPDATE users SET password_hash = $1 WHERE email = 'carrier@test.com'", [testHash]);
  
  console.log('Passwords fixed successfully');
  await client.end();
}

fix().catch(console.error);
