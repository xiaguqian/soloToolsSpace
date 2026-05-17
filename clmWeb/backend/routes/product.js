const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, requireTenant } = require('../middleware/auth');

router.use(authenticateToken);
router.use(requireTenant);

router.get('/list', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, categoryId, keyword, status } = req.query;
    const tenantId = req.user.tenant_id;
    
    let sql = 'SELECT p.*, c.name as category_name FROM product p LEFT JOIN category c ON p.category_id = c.id WHERE p.tenant_id = ?';
    const params = [tenantId];
    
    if (categoryId) {
      sql += ' AND p.category_id = ?';
      params.push(categoryId);
    }
    if (keyword) {
      sql += ' AND p.name LIKE ?';
      params.push(`%${keyword}%`);
    }
    if (status !== undefined) {
      sql += ' AND p.status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY p.created_at DESC';
    
    const offset = (page - 1) * pageSize;
    const countSql = sql.replace('SELECT p.*, c.name as category_name', 'SELECT COUNT(*) as total');
    
    const [countRows] = await pool.execute(countSql, params);
    const total = countRows[0].total;
    
    sql += ' LIMIT ?, ?';
    params.push(offset, parseInt(pageSize));
    
    const [rows] = await pool.execute(sql, params);
    
    res.json({
      code: 200,
      data: {
        list: rows,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    console.error('获取商品列表错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenant_id;
    
    const [rows] = await pool.execute(
      'SELECT p.*, c.name as category_name FROM product p LEFT JOIN category c ON p.category_id = c.id WHERE p.id = ? AND p.tenant_id = ?',
      [id, tenantId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '商品不存在' });
    }

    const [skuRows] = await pool.execute('SELECT * FROM product_sku WHERE product_id = ?', [id]);
    
    res.json({
      code: 200,
      data: {
        ...rows[0],
        skus: skuRows
      }
    });
  } catch (error) {
    console.error('获取商品详情错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, price, category_id, image, stock, status, description, skus } = req.body;
    const tenantId = req.user.tenant_id;
    
    if (!name || !price || !category_id) {
      return res.status(400).json({ code: 400, message: '请填写商品名称、价格和分类' });
    }

    const [result] = await pool.execute(
      'INSERT INTO product (tenant_id, category_id, name, price, image, stock, status, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [tenantId, category_id, name, price, image || '', stock || -1, status || 1, description || '']
    );

    const productId = result.insertId;

    if (skus && Array.isArray(skus)) {
      for (const sku of skus) {
        await pool.execute(
          'INSERT INTO product_sku (product_id, spec_name, price_extra) VALUES (?, ?, ?)',
          [productId, sku.spec_name, sku.price_extra || 0]
        );
      }
    }

    res.json({ code: 200, message: '添加成功', data: { id: productId } });
  } catch (error) {
    console.error('添加商品错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category_id, image, stock, status, description, skus } = req.body;
    const tenantId = req.user.tenant_id;
    
    const [existsRows] = await pool.execute('SELECT id FROM product WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    if (existsRows.length === 0) {
      return res.status(404).json({ code: 404, message: '商品不存在' });
    }

    await pool.execute(
      'UPDATE product SET name = ?, price = ?, category_id = ?, image = ?, stock = ?, status = ?, description = ? WHERE id = ?',
      [name, price, category_id, image || '', stock || -1, status, description || '', id]
    );

    await pool.execute('DELETE FROM product_sku WHERE product_id = ?', [id]);
    
    if (skus && Array.isArray(skus)) {
      for (const sku of skus) {
        await pool.execute(
          'INSERT INTO product_sku (product_id, spec_name, price_extra) VALUES (?, ?, ?)',
          [id, sku.spec_name, sku.price_extra || 0]
        );
      }
    }

    res.json({ code: 200, message: '修改成功' });
  } catch (error) {
    console.error('修改商品错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenant_id;
    
    const [existsRows] = await pool.execute('SELECT id FROM product WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    if (existsRows.length === 0) {
      return res.status(404).json({ code: 404, message: '商品不存在' });
    }

    await pool.execute('DELETE FROM product_sku WHERE product_id = ?', [id]);
    await pool.execute('DELETE FROM product WHERE id = ?', [id]);
    
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    console.error('删除商品错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.put('/batch-status', async (req, res) => {
  try {
    const { ids, status } = req.body;
    const tenantId = req.user.tenant_id;
    
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ code: 400, message: '请选择商品' });
    }

    const placeholders = ids.map(() => '?').join(',');
    await pool.execute(`UPDATE product SET status = ? WHERE id IN (${placeholders}) AND tenant_id = ?`, [status, ...ids, tenantId]);
    
    res.json({ code: 200, message: '操作成功' });
  } catch (error) {
    console.error('批量操作错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

module.exports = router;
