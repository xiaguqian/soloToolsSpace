import express from 'express';
import db from '../db.js';

const router = express.Router();

router.post('/login', (req, res) => {
  const { tenantId, phone } = req.body;
  
  db.get('SELECT * FROM end_user WHERE tenant_id = ? AND phone = ?', [tenantId, phone], (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    if (row) {
      return res.json({ success: true, data: row });
    }
    
    db.run('INSERT INTO end_user (tenant_id, phone, nickname) VALUES (?, ?, ?)', [tenantId, phone, `用户${phone.slice(-4)}`], function(err) {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      db.get('SELECT * FROM end_user WHERE id = ?', [this.lastID], (err, newRow) => {
        if (err) {
          return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, data: newRow });
      });
    });
  });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nickname, address_list } = req.body;
  
  const updates: any[] = [];
  const params: any[] = [];
  
  if (nickname) {
    updates.push('nickname = ?');
    params.push(nickname);
  }
  if (address_list) {
    updates.push('address_list = ?');
    params.push(JSON.stringify(address_list));
  }
  
  params.push(id);
  
  db.run(`UPDATE end_user SET ${updates.join(', ')} WHERE id = ?`, params, function(err) {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    db.get('SELECT * FROM end_user WHERE id = ?', [id], (err, row) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      res.json({ success: true, data: row });
    });
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM end_user WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    if (!row) {
      return res.status(404).json({ success: false, error: '用户不存在' });
    }
    res.json({ success: true, data: row });
  });
});

export default router;