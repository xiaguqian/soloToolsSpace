
import mysql from 'mysql2/promise';
import fs from 'fs';

export const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '871502794',
  database: 'clm_mob',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function initDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '871502794',
    });
    
    await connection.query('CREATE DATABASE IF NOT EXISTS clm_mob');
    await connection.end();
    
    const sql = fs.readFileSync('./init.sql', 'utf8');
    const queries = sql.split(';').filter((q: string) => q.trim());
    
    for (const query of queries) {
      if (query.trim()) {
        await pool.query(query);
      }
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}
