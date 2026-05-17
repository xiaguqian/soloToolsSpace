const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authenticateToken = require('../middleware/auth');

router.get('/list', authenticateToken, async (req, res) => {
  try {
    const { type } = req.query;
    const userId = req.user.id;
    
    let query = 'SELECT id, url, type, created_at as createTime FROM gallery WHERE user_id = ?';
    let params = [userId];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    const [images] = await pool.query(query, params);
    res.json({ list: images });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { url, type } = req.body;
    const userId = req.user.id;
    
    await pool.query('INSERT INTO gallery (user_id, url, type) VALUES (?, ?, ?)', [userId, url, type]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/delete', authenticateToken, async (req, res) => {
  try {
    const { id } = req.body;
    const userId = req.user.id;
    
    await pool.query('DELETE FROM gallery WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;