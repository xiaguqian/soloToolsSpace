const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authenticateToken = require('../middleware/auth');

router.get('/list', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, type, isPaid, travelMode, lat, lng } = req.query;
    const offset = (page - 1) * pageSize;
    
    let query = `SELECT id, name, cover_image as coverImage, description, type, is_paid as isPaid, 
                  price, rating, height, tags, address, open_time as openTime, 
                  latitude, longitude FROM scenic_spots WHERE 1=1`;
    let params = [];

    if (keyword) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    if (isPaid !== undefined) {
      query += ' AND is_paid = ?';
      params.push(isPaid);
    }

    const [spots] = await pool.query(query + ' LIMIT ? OFFSET ?', [...params, parseInt(pageSize), parseInt(offset)]);
    
    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM scenic_spots WHERE 1=1' + 
      (keyword ? ' AND (name LIKE ? OR description LIKE ?)' : '') + 
      (type ? ' AND type = ?' : '') + 
      (isPaid !== undefined ? ' AND is_paid = ?' : ''), params);

    let results = spots.map(spot => {
      let distance = null;
      if (lat && lng && spot.latitude && spot.longitude) {
        const R = 6371;
        const dLat = (spot.latitude - lat) * Math.PI / 180;
        const dLon = (spot.longitude - lng) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat * Math.PI / 180) * Math.cos(spot.latitude * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        distance = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
      }
      return {
        ...spot,
        tags: spot.tags ? JSON.parse(spot.tags) : [],
        distance: distance ? distance.toFixed(2) : null
      };
    });

    res.json({
      list: results,
      total: countResult[0].total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [spots] = await pool.query('SELECT * FROM scenic_spots WHERE id = ?', [id]);
    if (spots.length === 0) {
      return res.status(404).json({ error: '景点不存在' });
    }
    
    const spot = spots[0];
    
    await pool.query('UPDATE scenic_spots SET view_count = view_count + 1 WHERE id = ?', [id]);
    
    const [images] = await pool.query('SELECT image_url as url FROM scenic_images WHERE scenic_id = ?', [id]);
    
    const [notes] = await pool.query(`SELECT n.id, n.title, u.nickname as author, u.avatar as authorAvatar 
                                      FROM notes n JOIN users u ON n.author_id = u.id 
                                      WHERE n.scenic_id = ? AND n.status = 'active' LIMIT 5`, [id]);

    res.json({
      id: spot.id,
      name: spot.name,
      images: images.map(img => img.url),
      description: spot.description,
      rating: spot.rating,
      isPaid: spot.is_paid,
      price: spot.price,
      address: spot.address,
      openTime: spot.open_time,
      type: spot.type,
      tags: spot.tags ? JSON.parse(spot.tags) : [],
      notes: notes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/favorite', authenticateToken, async (req, res) => {
  try {
    const { scenicId } = req.body;
    const userId = req.user.id;
    
    await pool.query('INSERT INTO favorites (user_id, type, target_id) VALUES (?, ?, ?)', [userId, 'scenic', scenicId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/unfavorite', authenticateToken, async (req, res) => {
  try {
    const { scenicId } = req.body;
    const userId = req.user.id;
    
    await pool.query('DELETE FROM favorites WHERE user_id = ? AND type = ? AND target_id = ?', [userId, 'scenic', scenicId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;