const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    const [rows] = await pool.execute('SELECT * FROM staff WHERE phone = ? AND status = 1', [phone]);
    if (!rows.length) {
      return res.status(401).json({ code: 401, message: '手机号或密码错误' });
    }

    const staff = rows[0];
    const valid = await bcrypt.compare(password, staff.password_hash);
    
    if (!valid) {
      return res.status(401).json({ code: 401, message: '手机号或密码错误' });
    }

    const token = jwt.sign({ id: staff.id, tenant_id: staff.tenant_id, role: staff.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    
    const [tenant] = await pool.execute('SELECT * FROM tenant WHERE id = ?', [staff.tenant_id]);

    res.json({
      code: 200,
      data: {
        token,
        user: {
          id: staff.id,
          name: staff.name,
          phone: staff.phone,
          role: staff.role,
          tenant_id: staff.tenant_id
        },
        tenant: tenant[0]
      },
      message: '登录成功'
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

const logout = (req, res) => {
  res.json({ code: 200, message: '退出成功' });
};

const getProfile = async (req, res) => {
  try {
    const [tenant] = await pool.execute('SELECT * FROM tenant WHERE id = ?', [req.user.tenant_id]);
    res.json({
      code: 200,
      data: {
        user: {
          id: req.user.id,
          name: req.user.name,
          phone: req.user.phone,
          role: req.user.role,
          tenant_id: req.user.tenant_id
        },
        tenant: tenant[0]
      }
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

module.exports = { login, logout, getProfile };