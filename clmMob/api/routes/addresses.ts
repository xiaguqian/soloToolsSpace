
import { Router } from 'express';
import { pool } from '../config/db';

const router = Router();

router.get('/', async (req, res) => {
  const { phone } = req.query;
  try {
    const [rows] = await pool.execute('SELECT * FROM user_address WHERE user_phone = ? ORDER BY is_default DESC, created_at DESC', [phone || '13800138000']);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/', async (req, res) => {
  const { tenant_id, user_phone, receiver, phone, address_detail, is_default } = req.body;
  
  try {
    if (is_default) {
      await pool.execute('UPDATE user_address SET is_default = 0 WHERE user_phone = ?', [user_phone]);
    }
    
    const [result] = await pool.execute(
      'INSERT INTO user_address (tenant_id, user_phone, receiver, phone, address_detail, is_default) VALUES (?, ?, ?, ?, ?, ?)',
      [tenant_id, user_phone, receiver, phone, address_detail, is_default ? 1 : 0]
    );
    
    res.json({ id: (result as any).insertId });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/:id', async (req, res) => {
  const { receiver, phone, address_detail, is_default } = req.body;
  
  try {
    if (is_default) {
      const [addressRows] = await pool.execute('SELECT user_phone FROM user_address WHERE id = ?', [req.params.id]);
      const addresses = addressRows as any[];
      if (addresses.length > 0) {
        await pool.execute('UPDATE user_address SET is_default = 0 WHERE user_phone = ?', [addresses[0].user_phone]);
      }
    }
    
    await pool.execute(
      'UPDATE user_address SET receiver = ?, phone = ?, address_detail = ?, is_default = ? WHERE id = ?',
      [receiver, phone, address_detail, is_default ? 1 : 0, req.params.id]
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM user_address WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
