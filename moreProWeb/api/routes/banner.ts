import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/tenant/:tenantId', (req, res) => {
  const { tenantId } = req.params;
  db.all('SELECT * FROM banner WHERE tenant_id = ? AND status = 1 ORDER BY sort_order', [tenantId], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, data: rows });
  });
});

export default router;