import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/tenant/:tenantId', (req, res) => {
  const { tenantId } = req.params;
  const { category, keyword } = req.query;
  
  let query = 'SELECT * FROM product WHERE tenant_id = ? AND status = 1';
  let params: any[] = [tenantId];
  
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  
  if (keyword) {
    query += ' AND name LIKE ?';
    params.push(`%${keyword}%`);
  }
  
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, data: rows });
  });
});

router.get('/tenant/:tenantId/categories', (req, res) => {
  const { tenantId } = req.params;
  db.all('SELECT * FROM category WHERE tenant_id = ? AND status = 1 ORDER BY sort_order', [tenantId], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, data: rows });
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM product WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    if (!row) {
      return res.status(404).json({ success: false, error: '商品不存在' });
    }
    res.json({ success: true, data: row });
  });
});

export default router;