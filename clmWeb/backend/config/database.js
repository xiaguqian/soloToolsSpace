const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000
});

const promisePool = pool.promise();

const testConnection = (callback) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('❌ 数据库连接失败:', err.message);
      callback(false);
      return;
    }
    console.log('✅ 数据库连接成功');
    connection.release();
    callback(true);
  });
};

const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        return reject(err);
      }
      connection.query(sql, params, (error, results, fields) => {
        connection.release();
        if (error) {
          return reject(error);
        }
        resolve({ results, fields });
      });
    });
  });
};

module.exports = { pool, promisePool, testConnection, query };
