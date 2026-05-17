const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken, requireTenant } = require('../middleware/auth');

router.use(authenticateToken);
router.use(requireTenant);

router.get('/list', async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { results: rows } = await query('SELECT * FROM category WHERE tenant_id = ? ORDER BY sort_order ASC', [tenantId]);
    res.json({ code: 200, data: rows });
  } catch (error) {
    console.error('获取分类列表错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenant_id;
    const { results: rows } = await query('SELECT * FROM category WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '分类不存在' });
    }
    res.json({ code: 200, data: rows[0] });
  } catch (error) {
    console.error('获取分类详情错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, sort_order } = req.body;
    const tenantId = req.user.tenant_id;
    
    if (!name) {
      return res.status(400).json({ code: 400, message: '请填写分类名称' });
    }

    const { results: result } = await query(
      'INSERT INTO category (tenant_id, name, sort_order) VALUES (?, ?, ?)',
      [tenantId, name, sort_order || 0]
    );

    res.json({ code: 200, message: '添加成功', data: { id: result.insertId } });
  } catch (error) {
    console.error('添加分类错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sort_order } = req.body;
    const tenantId = req.user.tenant_id;
    
    const { results: existsRows } = await query('SELECT id FROM category WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    if (existsRows.length === 0) {
      return res.status(404).json({ code: 404, message: '分类不存在' });
    }

    await query('UPDATE category SET name = ?, sort_order = ? WHERE id = ?', [name, sort_order || 0, id]);
    
    res.json({ code: 200, message: '修改成功' });
  } catch (error) {
    console.error('修改分类错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenant_id;
    
    const { results: existsRows } = await query('SELECT id FROM category WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    if (existsRows.length === 0) {
      return res.status(404).json({ code: 404, message: '分类不存在' });
    }

    const { results: productRows } = await query('SELECT id FROM product WHERE category_id = ? AND tenant_id = ?', [id, tenantId]);
    if (productRows.length > 0) {
      return res.status(400).json({ code: 400, message: '该分类下存在商品，无法删除' });
    }

    await query('DELETE FROM category WHERE id = ?', [id]);
    
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    console.error('删除分类错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.put('/sort', async (req, res) => {
  try {
    const { items } = req.body;
    const tenantId = req.user.tenant_id;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ code: 400, message: '参数错误' });
    }

    for (const item of items) {
      await query('UPDATE category SET sort_order = ? WHERE id = ? AND tenant_id = ?', [item.sort_order, item.id, tenantId]);
    }
    
    res.json({ code: 200, message: '排序成功' });
  } catch (error) {
    console.error('排序分类错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

module.exports = router;
