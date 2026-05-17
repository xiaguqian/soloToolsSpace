import express from 'express';
import db from '../db.js';

const router = express.Router();

router.post('/', (req, res) => {
  const { tenantId, endUserId, items, totalAmount, address } = req.body;
  
  const orderNo = `${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
  
  db.run(
    'INSERT INTO orders (tenant_id, end_user_id, total_amount, order_no, address, items) VALUES (?, ?, ?, ?, ?, ?)',
    [tenantId, endUserId, totalAmount, orderNo, JSON.stringify(address), JSON.stringify(items)],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      db.get('SELECT * FROM orders WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, data: row });
      });
    }
  );
});

router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  db.all('SELECT * FROM orders WHERE end_user_id = ? ORDER BY created_at DESC', [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, data: rows });
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    if (!row) {
      return res.status(404).json({ success: false, error: '订单不存在' });
    }
    res.json({ success: true, data: row });
  });
});

router.put('/:id/cancel', (req, res) => {
  const { id } = req.params;
  db.run('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = "pending"', ['cancelled', id], function(err) {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    if (this.changes === 0) {
      return res.status(400).json({ success: false, error: '无法取消该订单' });
    }
    res.json({ success: true, message: '订单已取消' });
  });
});

router.put('/:id/pay', (req, res) => {
  const { id } = req.params;
  db.run('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = "pending"', ['paid', id], function(err) {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    if (this.changes === 0) {
      return res.status(400).json({ success: false, error: '无法支付该订单' });
    }
    res.json({ success: true, message: '支付成功' });
  });
});

export default router;