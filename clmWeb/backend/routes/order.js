const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticateToken, requireTenant } = require('../middleware/auth');

router.use(authenticateToken);
router.use(requireTenant);

router.get('/list', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, type, order_status, start_time, end_time } = req.query;
    const tenantId = req.user.tenant_id;
    
    let sql = 'SELECT o.*, t.table_name FROM orders o LEFT JOIN dining_table t ON o.table_id = t.id WHERE o.tenant_id = ?';
    const params = [tenantId];
    
    if (type !== undefined) {
      sql += ' AND o.type = ?';
      params.push(type);
    }
    if (order_status !== undefined) {
      sql += ' AND o.order_status = ?';
      params.push(order_status);
    }
    if (start_time) {
      sql += ' AND o.created_at >= ?';
      params.push(start_time);
    }
    if (end_time) {
      sql += ' AND o.created_at <= ?';
      params.push(end_time);
    }
    
    sql += ' ORDER BY o.created_at DESC';
    
    const offset = (page - 1) * pageSize;
    const countSql = sql.replace('SELECT o.*, t.table_name', 'SELECT COUNT(*) as total');
    
    const { results: countRows } = await query(countSql, params);
    const total = countRows[0].total;
    
    sql += ' LIMIT ?, ?';
    params.push(offset, parseInt(pageSize));
    
    const { results: rows } = await query(sql, params);
    
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
    console.error('获取订单列表错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenant_id;
    
    const { results: orderRows } = await query(
      'SELECT o.*, t.table_name FROM orders o LEFT JOIN dining_table t ON o.table_id = t.id WHERE o.id = ? AND o.tenant_id = ?',
      [id, tenantId]
    );
    
    if (orderRows.length === 0) {
      return res.status(404).json({ code: 404, message: '订单不存在' });
    }

    const { results: itemRows } = await query('SELECT * FROM order_item WHERE order_id = ?', [id]);
    
    let address = null;
    if (orderRows[0].address_id) {
      const { results: addressRows } = await query('SELECT * FROM user_address WHERE id = ?', [orderRows[0].address_id]);
      if (addressRows.length > 0) {
        address = addressRows[0];
      }
    }

    res.json({
      code: 200,
      data: {
        ...orderRows[0],
        items: itemRows,
        address
      }
    });
  } catch (error) {
    console.error('获取订单详情错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.put('/:id/accept', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenant_id;
    
    const { results: rows } = await query('SELECT * FROM orders WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '订单不存在' });
    }

    const order = rows[0];
    if (order.order_status !== 0) {
      return res.status(400).json({ code: 400, message: '订单状态不允许接单' });
    }

    await query('UPDATE orders SET order_status = 1 WHERE id = ?', [id]);
    
    res.json({ code: 200, message: '接单成功' });
  } catch (error) {
    console.error('接单错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.put('/:id/progress', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenant_id;
    
    const { results: rows } = await query('SELECT * FROM orders WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '订单不存在' });
    }

    const order = rows[0];
    if (order.order_status !== 1) {
      return res.status(400).json({ code: 400, message: '订单状态不允许确认制作' });
    }

    await query('UPDATE orders SET order_status = 2 WHERE id = ?', [id]);
    
    res.json({ code: 200, message: '确认制作成功' });
  } catch (error) {
    console.error('确认制作错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.put('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenant_id;
    
    const { results: rows } = await query('SELECT * FROM orders WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '订单不存在' });
    }

    const order = rows[0];
    if (order.order_status !== 2 && order.order_status !== 4) {
      return res.status(400).json({ code: 400, message: '订单状态不允许完成' });
    }

    await query('UPDATE orders SET order_status = 2 WHERE id = ?', [id]);
    
    res.json({ code: 200, message: '订单已完成' });
  } catch (error) {
    console.error('完成订单错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.put('/:id/deliver', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenant_id;
    
    const { results: rows } = await query('SELECT * FROM orders WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '订单不存在' });
    }

    const order = rows[0];
    if (order.type !== 2) {
      return res.status(400).json({ code: 400, message: '只有外卖订单才能标记配送' });
    }
    if (order.order_status !== 1) {
      return res.status(400).json({ code: 400, message: '订单状态不允许配送' });
    }

    await query('UPDATE orders SET order_status = 4 WHERE id = ?', [id]);
    
    res.json({ code: 200, message: '已标记为配送中' });
  } catch (error) {
    console.error('标记配送错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.put('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenant_id;
    
    const { results: rows } = await query('SELECT * FROM orders WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '订单不存在' });
    }

    const order = rows[0];
    if (order.order_status === 2) {
      return res.status(400).json({ code: 400, message: '已完成的订单无法取消' });
    }

    await query('UPDATE orders SET order_status = 3 WHERE id = ?', [id]);
    
    res.json({ code: 200, message: '订单已取消' });
  } catch (error) {
    console.error('取消订单错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

module.exports = router;
