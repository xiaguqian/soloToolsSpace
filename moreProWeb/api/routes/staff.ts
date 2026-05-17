import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';

const router = express.Router();

router.post('/login', (req, res) => {
  const { phone, password } = req.body;
  
  db.get('SELECT * FROM staff WHERE phone = ? AND status = 1', [phone], (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    if (!row) {
      return res.status(401).json({ success: false, error: '账号或密码错误' });
    }
    
    bcrypt.compare(password, row.password_hash, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      if (!isMatch) {
        return res.status(401).json({ success: false, error: '账号或密码错误' });
      }
      res.json({ success: true, data: { id: row.id, tenant_id: row.tenant_id, phone: row.phone, role: row.role } });
    });
  });
});

export default router;