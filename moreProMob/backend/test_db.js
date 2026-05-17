const mysql = require('mysql2/promise');
require('dotenv').config();

const testDb = async () => {
  console.log('Testing database connection...');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: 3306,
      connectTimeout: 5000
    });
    
    console.log('Connection created successfully');
    
    console.log('Executing query...');
    const [rows] = await connection.execute('SELECT * FROM staff WHERE phone = ?', ['13800138000']);
    console.log('Query result:', rows);
    
    await connection.end();
    console.log('Test completed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testDb();