const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTables() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cashcash_final_app',
    port: process.env.DB_PORT || 3306,
  });

  try {
    const [rows] = await pool.query('SHOW TABLES');
    console.log('Tables in database:');
    rows.forEach(row => console.log(Object.values(row)[0]));
  } catch (e) {
    console.error('Error listing tables:', e);
  } finally {
    await pool.end();
  }
}

checkTables();
