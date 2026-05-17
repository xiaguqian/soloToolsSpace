const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authenticateToken = require('../middleware/auth');

router.get('/list', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [scenicFavorites] = await pool.query(`SELECT s.id, s.name, s.address 
                                                FROM favorites f 
                                                JOIN scenic_spots s ON f.target_id = s.id 
                                                WHERE f.user_id = ? AND f.type = 'scenic'`, [userId]);
    
    const [noteFavorites] = await pool.query(`SELECT n.id, n.title, u.nickname as author 
                                              FROM favorites f 
                                              JOIN notes n ON f.target_id = n.id 
                                              JOIN users u ON n.author_id = u.id 
                                              WHERE f.user_id = ? AND f.type = 'note'`, [userId]);
    
    const [imageFavorites] = await pool.query(`SELECT g.id, g.url 
                                                FROM favorites f 
                                                JOIN gallery g ON f.target_id = g.id 
                                                WHERE f.user_id = ? AND f.type = 'image'`, [userId]);
    
    res.json({
      notes: noteFavorites,
      scenics: scenicFavorites,
      images: imageFavorites
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;