const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const updatePassword = async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    const passwordHash = bcrypt.hashSync('123456', 10);
    const [result] = await pool.execute(
      'UPDATE staff SET password_hash = ? WHERE phone = ?',
      [passwordHash, '13800138000']
    );
    console.log('密码更新成功:', result.affectedRows, '行受影响');
    process.exit(0);
  } catch (error) {
    console.error('密码更新失败:', error.message);
    process.exit(1);
  }
};

updatePassword();