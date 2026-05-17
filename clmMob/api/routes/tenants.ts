
import { Router } from 'express';
import { pool } from '../config/db';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM tenant');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM tenant WHERE id = ?', [req.params.id]);
    const tenants = rows as any[];
    if (tenants.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    res.json(tenants[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
