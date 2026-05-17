const jwt = require('jsonwebtoken');
require('dotenv').config();

const adminAuthenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '访问被拒绝，需要登录' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '无效的token' });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ error: '权限不足，需要管理员权限' });
    }
    req.user = user;
    next();
  });
};

module.exports = adminAuthenticate;