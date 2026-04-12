const { Client } = require('pg');

async function migrate() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'waselx_db',
    password: 'Hossam!@#45',
    port: 5432
  });
  
  await client.connect();
  
  console.log('Adding verification fields to users table...');
  
  try {
    // Add verification_status
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) 
      DEFAULT 'not_started' 
      CHECK (verification_status IN ('not_started', 'pending_review', 'verified', 'rejected'))
    `);

    // Add verification_type
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS verification_type VARCHAR(20) 
      CHECK (verification_type IN ('uaepass', 'passport', 'emirates_id'))
    `);

    // Add verification_doc_url
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS verification_doc_url TEXT
    `);

    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

migrate();
