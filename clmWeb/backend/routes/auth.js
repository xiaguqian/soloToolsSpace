const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

router.post('/login', async (req, res) => {
  try {
    console.log('📥 收到登录请求:', req.body);
    
    const { phone, password } = req.body;
    
    if (!phone || !password) {
      return res.status(400).json({ code: 400, message: '请输入手机号和密码' });
    }

    console.log('🔍 查询用户:', phone);
    const { results: rows } = await query('SELECT * FROM admin_user WHERE phone = ?', [phone]);
    console.log('📊 查询结果:', rows.length);
    
    if (rows.length === 0) {
      return res.status(401).json({ code: 401, message: '手机号或密码错误' });
    }

    const user = rows[0];
    console.log('👤 用户信息:', user.name, user.role);
    
    if (user.status === 0) {
      return res.status(401).json({ code: 401, message: '账号已禁用' });
    }

    console.log('🔑 验证密码...');
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log('✅ 密码验证结果:', isValidPassword);
    
    if (!isValidPassword) {
      return res.status(401).json({ code: 401, message: '手机号或密码错误' });
    }

    console.log('📝 生成Token...');
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    console.log('🔐 Token生成成功');
    
    let tenantInfo = null;
    if (user.tenant_id) {
      console.log('🏢 查询租户信息:', user.tenant_id);
      const { results: tenantRows } = await query('SELECT id, name, logo FROM tenant WHERE id = ?', [user.tenant_id]);
      if (tenantRows.length > 0) {
        tenantInfo = tenantRows[0];
      }
      console.log('🏠 租户信息:', tenantInfo);
    }

    console.log('📤 返回登录成功');
    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role,
          tenant_id: user.tenant_id,
          tenant: tenantInfo
        }
      }
    });
  } catch (error) {
    console.error('❌ 登录错误:', error.message);
    res.status(500).json({ code: 500, message: '服务器内部错误: ' + error.message });
  }
});

router.post('/change-password', async (req, res) => {
  try {
    const { phone, oldPassword, newPassword } = req.body;
    
    if (!phone || !oldPassword || !newPassword) {
      return res.status(400).json({ code: 400, message: '参数不全' });
    }

    const { results: rows } = await query('SELECT * FROM admin_user WHERE phone = ?', [phone]);
    
    if (rows.length === 0) {
      return res.status(401).json({ code: 401, message: '用户不存在' });
    }

    const user = rows[0];
    const isValidPassword = await bcrypt.compare(oldPassword, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ code: 401, message: '原密码错误' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    
    await query('UPDATE admin_user SET password_hash = ? WHERE id = ?', [passwordHash, user.id]);
    
    res.json({ code: 200, message: '密码修改成功' });
  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

module.exports = router;
