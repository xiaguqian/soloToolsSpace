import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/:tenantId', (req, res) => {
  const { tenantId } = req.params;
  db.get('SELECT * FROM tenant WHERE id = ? AND status = 1', [tenantId], (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    if (!row) {
      return res.status(404).json({ success: false, error: '商户不存在' });
    }
    res.json({ success: true, data: row });
  });
});

router.get('/', (req, res) => {
  db.all('SELECT id, name, logo FROM tenant WHERE status = 1', (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, data: rows });
  });
});

export default router;