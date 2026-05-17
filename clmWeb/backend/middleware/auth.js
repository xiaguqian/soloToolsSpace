const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ code: 401, message: '未授权' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.execute('SELECT * FROM admin_user WHERE id = ?', [decoded.id]);
    
    if (rows.length === 0) {
      return res.status(401).json({ code: 401, message: '用户不存在' });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    return res.status(403).json({ code: 403, message: 'token无效' });
  }
};

const requireTenant = (req, res, next) => {
  if (!req.user.tenant_id) {
    return res.status(403).json({ code: 403, message: '商户管理员才能访问此功能' });
  }
  next();
};

const requirePlatformAdmin = (req, res, next) => {
  if (req.user.role !== 1) {
    return res.status(403).json({ code: 403, message: '平台管理员才能访问此功能' });
  }
  next();
};

module.exports = { authenticateToken, requireTenant, requirePlatformAdmin };
