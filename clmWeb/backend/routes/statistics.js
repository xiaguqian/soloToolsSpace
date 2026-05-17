const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, requireTenant } = require('../middleware/auth');

router.use(authenticateToken);
router.use(requireTenant);

router.get('/today', async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const today = new Date().toISOString().split('T')[0];
    
    const [dineInRows] = await pool.execute(
      'SELECT COUNT(*) as count FROM orders WHERE tenant_id = ? AND type = 1 AND DATE(created_at) = ?',
      [tenantId, today]
    );
    
    const [takeoutRows] = await pool.execute(
      'SELECT COUNT(*) as count FROM orders WHERE tenant_id = ? AND type = 2 AND DATE(created_at) = ?',
      [tenantId, today]
    );
    
    const [revenueRows] = await pool.execute(
      'SELECT SUM(total_amount) as amount FROM orders WHERE tenant_id = ? AND pay_status = 1 AND DATE(created_at) = ?',
      [tenantId, today]
    );

    res.json({
      code: 200,
      data: {
        dine_in_count: dineInRows[0].count || 0,
        takeout_count: takeoutRows[0].count || 0,
        total_count: (dineInRows[0].count || 0) + (takeoutRows[0].count || 0),
        revenue: revenueRows[0].amount || 0
      }
    });
  } catch (error) {
    console.error('获取今日统计错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.get('/hot-products', async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const today = new Date().toISOString().split('T')[0];
    
    const [rows] = await pool.execute(`
      SELECT oi.product_name, SUM(oi.quantity) as total_quantity
      FROM order_item oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.tenant_id = ? AND DATE(o.created_at) = ?
      GROUP BY oi.product_name
      ORDER BY total_quantity DESC
      LIMIT 10
    `, [tenantId, today]);

    res.json({ code: 200, data: rows });
  } catch (error) {
    console.error('获取热销商品错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.get('/trend', async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const days = 7;
    const result = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count, SUM(total_amount) as amount FROM orders WHERE tenant_id = ? AND DATE(created_at) = ?',
        [tenantId, dateStr]
      );
      
      result.push({
        date: dateStr,
        count: rows[0].count || 0,
        amount: rows[0].amount || 0
      });
    }

    res.json({ code: 200, data: result });
  } catch (error) {
    console.error('获取订单趋势错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    
    const [productCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM product WHERE tenant_id = ? AND status = 1',
      [tenantId]
    );
    
    const [tableCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM dining_table WHERE tenant_id = ? AND status = 1',
      [tenantId]
    );
    
    const today = new Date().toISOString().split('T')[0];
    const [pendingOrders] = await pool.execute(
      'SELECT COUNT(*) as count FROM orders WHERE tenant_id = ? AND order_status = 0 AND DATE(created_at) = ?',
      [tenantId, today]
    );
    
    res.json({
      code: 200,
      data: {
        product_count: productCount[0].count || 0,
        table_count: tableCount[0].count || 0,
        pending_count: pendingOrders[0].count || 0
      }
    });
  } catch (error) {
    console.error('获取统计摘要错误:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});

module.exports = router;
