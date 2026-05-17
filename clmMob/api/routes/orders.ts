
import { Router } from 'express';
import { pool } from '../config/db';

const router = Router();

router.post('/', async (req, res) => {
  const { tenant_id, type, table_id, address_id, items, total_amount } = req.body;
  
  try {
    const order_no = `ORD${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const [orderResult] = await pool.execute(
      'INSERT INTO orders (tenant_id, order_no, type, table_id, address_id, total_amount) VALUES (?, ?, ?, ?, ?, ?)',
      [tenant_id, order_no, type, table_id, address_id, total_amount]
    );
    
    const orderId = (orderResult as any).insertId;
    
    for (const item of items) {
      await pool.execute(
        'INSERT INTO order_item (order_id, product_name, price, quantity) VALUES (?, ?, ?, ?)',
        [orderId, item.name, item.price + (item.price_extra || 0), item.quantity]
      );
    }
    
    res.json({ order_id: orderId, order_no });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM orders ORDER BY create_time DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:orderId', async (req, res) => {
  try {
    const [orderRows] = await pool.execute('SELECT * FROM orders WHERE id = ?', [req.params.orderId]);
    const orders = orderRows as any[];
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const [itemRows] = await pool.execute('SELECT * FROM order_item WHERE order_id = ?', [req.params.orderId]);
    
    res.json({
      ...orders[0],
      items: itemRows
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/:orderId/pay', async (req, res) => {
  try {
    await pool.execute(
      'UPDATE orders SET pay_status = ?, order_status = ?, pay_time = NOW() WHERE id = ?',
      ['paid', 'preparing', req.params.orderId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/:orderId/cancel', async (req, res) => {
  try {
    await pool.execute('UPDATE orders SET order_status = ? WHERE id = ?', ['cancelled', req.params.orderId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
