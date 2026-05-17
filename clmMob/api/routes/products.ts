
import { Router } from 'express';
import { pool } from '../config/db';

const router = Router();

router.get('/:tenantId/categories', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM category WHERE tenant_id = ? ORDER BY sort_order', [req.params.tenantId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:tenantId/products', async (req, res) => {
  try {
    const { categoryId, keyword } = req.query;
    let query = 'SELECT * FROM product WHERE tenant_id = ? AND status = 1';
    let params: any[] = [req.params.tenantId];
    
    if (categoryId) {
      query += ' AND category_id = ?';
      params.push(categoryId);
    }
    
    if (keyword) {
      query += ' AND name LIKE ?';
      params.push(`%${keyword}%`);
    }
    
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:tenantId/products/:productId', async (req, res) => {
  try {
    const [productRows] = await pool.execute('SELECT * FROM product WHERE tenant_id = ? AND id = ?', [req.params.tenantId, req.params.productId]);
    const products = productRows as any[];
    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const [skuRows] = await pool.execute('SELECT * FROM product_sku WHERE product_id = ?', [req.params.productId]);
    
    res.json({
      ...products[0],
      skus: skuRows
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
