const { execute } = require('../config/db');

const getDashboard = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const [todayOrders] = await execute(
      'SELECT COUNT(*) as count, SUM(total_amount) as amount FROM `order` WHERE tenant_id = ? AND DATE(created_at) = ?',
      [req.user.tenant_id, today]
    );
    
    const [totalOrders] = await execute(
      'SELECT COUNT(*) as count, SUM(total_amount) as amount FROM `order` WHERE tenant_id = ?',
      [req.user.tenant_id]
    );
    
    const [totalUsers] = await execute(
      'SELECT COUNT(*) as count FROM end_user WHERE tenant_id = ?',
      [req.user.tenant_id]
    );
    
    const [totalProducts] = await execute(
      'SELECT COUNT(*) as count FROM product WHERE tenant_id = ?',
      [req.user.tenant_id]
    );

    res.json({
      code: 200,
      data: {
        todayOrders: todayOrders[0].count || 0,
        todayAmount: parseFloat(todayOrders[0].amount) || 0,
        totalOrders: totalOrders[0].count || 0,
        totalAmount: parseFloat(totalOrders[0].amount) || 0,
        totalUsers: totalUsers[0].count || 0,
        totalProducts: totalProducts[0].count || 0
      }
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

const getOrderTrend = async (req, res) => {
  try {
    const { period = 'day' } = req.query;
    
    let sql = '';
    if (period === 'day') {
      sql = `SELECT DATE(o.created_at) as date, COUNT(*) as count, SUM(o.total_amount) as amount 
             FROM \`order\` o 
             WHERE o.tenant_id = ? AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
             GROUP BY DATE(o.created_at) ORDER BY date`;
    } else if (period === 'week') {
      sql = `SELECT CONCAT(YEAR(o.created_at), '-', WEEK(o.created_at)) as week, COUNT(*) as count, SUM(o.total_amount) as amount 
             FROM \`order\` o 
             WHERE o.tenant_id = ? AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 4 WEEK)
             GROUP BY YEAR(o.created_at), WEEK(o.created_at) ORDER BY week`;
    } else if (period === 'month') {
      sql = `SELECT DATE_FORMAT(o.created_at, '%Y-%m') as month, COUNT(*) as count, SUM(o.total_amount) as amount 
             FROM \`order\` o 
             WHERE o.tenant_id = ? AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
             GROUP BY DATE_FORMAT(o.created_at, '%Y-%m') ORDER BY month`;
    }

    const [rows] = await execute(sql, [req.user.tenant_id]);
    
    res.json({ code: 200, data: rows });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

const getProductRanking = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const [rows] = await execute(
      'SELECT p.id, p.name, p.price, SUM(JSON_LENGTH(o.items_json)) as sales FROM product p LEFT JOIN `order` o ON FIND_IN_SET(p.id, REPLACE(REPLACE(o.items_json, \'{"product_id":\', \'\'), \',\' ,\'\')) > 0 WHERE p.tenant_id = ? AND o.tenant_id = ? GROUP BY p.id ORDER BY sales DESC LIMIT ?',
      [req.user.tenant_id, req.user.tenant_id, parseInt(limit)]
    );

    res.json({ code: 200, data: rows });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

module.exports = { getDashboard, getOrderTrend, getProductRanking };