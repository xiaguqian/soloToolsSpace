const { execute } = require('../config/db');

const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, order_no = '', status, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;

    let sql = 'SELECT o.*, eu.nickname, eu.phone FROM `order` o LEFT JOIN end_user eu ON o.end_user_id = eu.id WHERE o.tenant_id = ?';
    const params = [req.user.tenant_id];

    if (order_no) {
      sql += ' AND o.order_no LIKE ?';
      params.push(`%${order_no}%`);
    }
    if (status !== undefined) {
      sql += ' AND o.status = ?';
      params.push(status);
    }
    if (start_date) {
      sql += ' AND o.created_at >= ?';
      params.push(start_date);
    }
    if (end_date) {
      sql += ' AND o.created_at <= ?';
      params.push(end_date);
    }

    sql += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [rows] = await execute(sql, params);
    const [count] = await execute('SELECT COUNT(*) as total FROM `order` WHERE tenant_id = ?', [req.user.tenant_id]);

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

const getOrder = async (req, res) => {
  try {
    const [rows] = await execute(
      'SELECT o.*, eu.nickname, eu.phone FROM `order` o LEFT JOIN end_user eu ON o.end_user_id = eu.id WHERE o.id = ? AND o.tenant_id = ?',
      [req.params.id, req.user.tenant_id]
    );
    if (!rows.length) {
      return res.status(404).json({ code: 404, message: '订单不存在' });
    }
    rows[0].items_json = JSON.parse(rows[0].items_json || '[]');
    res.json({ code: 200, data: rows[0] });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { status } = req.body;
    const now = new Date();
    
    let updateField = '';
    if (status === 1) updateField = 'pay_time';
    else if (status === 2) updateField = 'ship_time';
    else if (status === 3) updateField = 'finish_time';

    const [result] = await execute(
      `UPDATE \`order\` SET status = ?, ${updateField} = ? WHERE id = ? AND tenant_id = ?`,
      [status, now, req.params.id, req.user.tenant_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ code: 404, message: '订单不存在' });
    }

    res.json({ code: 200, message: '订单状态更新成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

const exportOrders = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let sql = 'SELECT o.order_no, o.total_amount, o.status, o.created_at, eu.nickname, eu.phone FROM `order` o LEFT JOIN end_user eu ON o.end_user_id = eu.id WHERE o.tenant_id = ?';
    const params = [req.user.tenant_id];

    if (start_date) {
      sql += ' AND o.created_at >= ?';
      params.push(start_date);
    }
    if (end_date) {
      sql += ' AND o.created_at <= ?';
      params.push(end_date);
    }

    const [rows] = await execute(sql, params);
    
    const headers = ['订单号', '金额', '状态', '创建时间', '用户昵称', '用户手机'];
    const statusMap = { 0: '待支付', 1: '已支付', 2: '已发货', 3: '已完成', 4: '已取消' };
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += `${row.order_no},${row.total_amount},${statusMap[row.status]},${row.created_at},${row.nickname || ''},${row.phone || ''}\n`;
    });

    res.setHeader('Content-Type', 'text/csv;charset=utf-8');
    res.setHeader('Content-Disposition', `attachment;filename=orders_${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
};

module.exports = { getOrders, getOrder, updateOrder, exportOrders };