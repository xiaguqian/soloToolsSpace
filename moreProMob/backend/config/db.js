const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'merchant_db',
  port: 3306,
  timezone: 'local',
  connectTimeout: 5000
});

connection.connect((err) => {
  if (err) {
    console.error('数据库连接失败:', err);
    process.exit(1);
  }
  console.log('数据库连接成功');
});

const execute = (sql, params) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve([results]);
      }
    });
  });
};

module.exports = { execute };