const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ code: 401, message: '未授权' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.execute('SELECT * FROM staff WHERE id = ?', [decoded.id]);
    
    if (!rows.length) {
      return res.status(401).json({ code: 401, message: '用户不存在' });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    return res.status(401).json({ code: 401, message: 'Token无效' });
  }
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role > role) {
      return res.status(403).json({ code: 403, message: '权限不足' });
    }
    next();
  };
};

module.exports = { authenticate, requireRole };