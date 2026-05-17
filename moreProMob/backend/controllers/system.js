const bcrypt = require('bcryptjs');
const { execute } = require('../config/db');

const getTenantInfo = async (req, res) => {
  try {
    const [rows] = await execute('SELECT * FROM tenant WHERE id = ?', [req.user.tenant_id]);
    if (!rows.length) {
      return res.status(404).json({ code: 404, message: '租户不存在' });
    }
    rows[0].config_json = JSON.parse(rows[0].config_json || '{}');
    res.json({ code: 200, data: rows[0] });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

const updateTenantInfo = async (req, res) => {
  try {
    const { name, logo, config_json } = req.body;
    await execute(
      'UPDATE tenant SET name = ?, logo = ?, config_json = ? WHERE id = ?',
      [name, logo, JSON.stringify(config_json), req.user.tenant_id]
    );
    res.json({ code: 200, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

const getStaffList = async (req, res) => {
  try {
    const [rows] = await execute('SELECT id, name, phone, role, status, created_at FROM staff WHERE tenant_id = ?', [req.user.tenant_id]);
    res.json({ code: 200, data: rows });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

const createStaff = async (req, res) => {
  try {
    const { name, phone, password, role } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    
    const [result] = await execute(
      'INSERT INTO staff (tenant_id, name, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [req.user.tenant_id, name, phone, passwordHash, role || 2]
    );
    
    res.json({ code: 200, data: { id: result.insertId }, message: '创建成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

const updateStaff = async (req, res) => {
  try {
    const { name, phone, role, status } = req.body;
    await execute(
      'UPDATE staff SET name = ?, phone = ?, role = ?, status = ? WHERE id = ? AND tenant_id = ?',
      [name, phone, role, status, req.params.id, req.user.tenant_id]
    );
    res.json({ code: 200, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

const deleteStaff = async (req, res) => {
  try {
    if (req.params.id == req.user.id) {
      return res.status(400).json({ code: 400, message: '不能删除自己' });
    }
    await execute('DELETE FROM staff WHERE id = ? AND tenant_id = ?', [req.params.id, req.user.tenant_id]);
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

module.exports = { getTenantInfo, updateTenantInfo, getStaffList, createStaff, updateStaff, deleteStaff };