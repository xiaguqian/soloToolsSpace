const pool = require('../config/db');

const getEndUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, keyword = '' } = req.query;
    const offset = (page - 1) * limit;

    let sql = 'SELECT * FROM end_user WHERE tenant_id = ?';
    const params = [req.user.tenant_id];

    if (keyword) {
      sql += ' AND (phone LIKE ? OR nickname LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [rows] = await pool.execute(sql, params);
    const [count] = await pool.execute('SELECT COUNT(*) as total FROM end_user WHERE tenant_id = ?', [req.user.tenant_id]);

    res.json({
      code: 200,
      data: {
        list: rows,
        total: count[0].total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

const getEndUser = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM end_user WHERE id = ? AND tenant_id = ?', [req.params.id, req.user.tenant_id]);
    if (!rows.length) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }
    res.json({ code: 200, data: rows[0] });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

const updateEndUser = async (req, res) => {
  try {
    const { nickname, points, tags } = req.body;
    await pool.execute(
      'UPDATE end_user SET nickname = ?, points = ?, tags = ? WHERE id = ? AND tenant_id = ?',
      [nickname, points, tags, req.params.id, req.user.tenant_id]
    );
    res.json({ code: 200, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

const addPoints = async (req, res) => {
  try {
    const { points } = req.body;
    await pool.execute(
      'UPDATE end_user SET points = points + ? WHERE id = ? AND tenant_id = ?',
      [points, req.params.id, req.user.tenant_id]
    );
    res.json({ code: 200, message: '积分添加成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

module.exports = { getEndUsers, getEndUser, updateEndUser, addPoints };