const pool = require('../config/db');

const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, keyword = '', category = '', status } = req.query;
    const offset = (page - 1) * limit;
    
    let sql = 'SELECT * FROM product WHERE tenant_id = ?';
    const params = [req.user.tenant_id];

    if (keyword) {
      sql += ' AND name LIKE ?';
      params.push(`%${keyword}%`);
    }
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (status !== undefined) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [rows] = await pool.execute(sql, params);
    const [count] = await pool.execute('SELECT COUNT(*) as total FROM product WHERE tenant_id = ?', [req.user.tenant_id]);

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

const getProduct = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM product WHERE id = ? AND tenant_id = ?', [req.params.id, req.user.tenant_id]);
    if (!rows.length) {
      return res.status(404).json({ code: 404, message: '商品不存在' });
    }
    res.json({ code: 200, data: rows[0] });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, price, stock, category, description, image_url } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO product (tenant_id, name, price, stock, category, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.tenant_id, name, price, stock || 0, category, description, image_url]
    );
    
    res.json({ code: 200, data: { id: result.insertId }, message: '创建成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, price, stock, category, description, image_url, status } = req.body;
    await pool.execute(
      'UPDATE product SET name = ?, price = ?, stock = ?, category = ?, description = ?, image_url = ?, status = ? WHERE id = ? AND tenant_id = ?',
      [name, price, stock, category, description, image_url, status, req.params.id, req.user.tenant_id]
    );
    
    res.json({ code: 200, message: '更新成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    await pool.execute('DELETE FROM product WHERE id = ? AND tenant_id = ?', [req.params.id, req.user.tenant_id]);
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await pool.execute('UPDATE product SET status = ? WHERE id = ? AND tenant_id = ?', [status, req.params.id, req.user.tenant_id]);
    res.json({ code: 200, message: '状态更新成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

const getCategories = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT DISTINCT category FROM product WHERE tenant_id = ? AND category IS NOT NULL', [req.user.tenant_id]);
    res.json({ code: 200, data: rows.map(r => r.category) });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, updateStatus, getCategories };