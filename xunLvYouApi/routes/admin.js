const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const adminAuthenticate = require('../middleware/adminAuth');

router.get('/scenic/list', adminAuthenticate, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword } = req.query;
    const offset = (page - 1) * pageSize;
    
    let query = 'SELECT * FROM scenic_spots WHERE 1=1';
    let params = [];
    
    if (keyword) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    
    const [spots] = await pool.query(query + ' LIMIT ? OFFSET ?', [...params, parseInt(pageSize), parseInt(offset)]);
    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM scenic_spots WHERE 1=1' + 
      (keyword ? ' AND (name LIKE ? OR description LIKE ?)' : ''), params);
    
    res.json({
      list: spots.map(s => ({
        ...s,
        tags: s.tags ? JSON.parse(s.tags) : []
      })),
      total: countResult[0].total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/scenic/create', adminAuthenticate, async (req, res) => {
  try {
    const { name, coverImage, description, type, isPaid, price, rating, height, tags, address, openTime, latitude, longitude } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO scenic_spots (name, cover_image, description, type, is_paid, price, rating, height, tags, address, open_time, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, coverImage, description, type, isPaid, price, rating, height, JSON.stringify(tags), address, openTime, latitude, longitude]
    );
    
    res.json({ id: result.insertId, success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/scenic/update', adminAuthenticate, async (req, res) => {
  try {
    const { id, name, coverImage, description, type, isPaid, price, rating, height, tags, address, openTime, latitude, longitude } = req.body;
    
    await pool.query(
      'UPDATE scenic_spots SET name=?, cover_image=?, description=?, type=?, is_paid=?, price=?, rating=?, height=?, tags=?, address=?, open_time=?, latitude=?, longitude=? WHERE id=?',
      [name, coverImage, description, type, isPaid, price, rating, height, JSON.stringify(tags), address, openTime, latitude, longitude, id]
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/scenic/delete', adminAuthenticate, async (req, res) => {
  try {
    const { id } = req.body;
    await pool.query('DELETE FROM scenic_spots WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/note/list', adminAuthenticate, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, status } = req.query;
    const offset = (page - 1) * pageSize;
    
    let query = `SELECT n.id, n.title, n.status, n.like_count as likeCount, n.comment_count as commentCount, n.favorite_count as favoriteCount, n.created_at as createTime, u.nickname as author FROM notes n JOIN users u ON n.author_id = u.id WHERE 1=1`;
    let params = [];
    
    if (keyword) {
      query += ' AND (n.title LIKE ? OR n.content LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    if (status) {
      query += ' AND n.status = ?';
      params.push(status);
    }
    
    const [notes] = await pool.query(query + ' ORDER BY n.created_at DESC LIMIT ? OFFSET ?', [...params, parseInt(pageSize), parseInt(offset)]);
    const [countResult] = await pool.query(`SELECT COUNT(*) as total FROM notes n JOIN users u ON n.author_id = u.id WHERE 1=1` + 
      (keyword ? ' AND (n.title LIKE ? OR n.content LIKE ?)' : '') + 
      (status ? ' AND n.status = ?' : ''), params);
    
    res.json({
      list: notes,
      total: countResult[0].total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/note/offline', adminAuthenticate, async (req, res) => {
  try {
    const { id } = req.body;
    await pool.query('UPDATE notes SET status = "offline" WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/note/top', adminAuthenticate, async (req, res) => {
  try {
    const { id } = req.body;
    await pool.query('UPDATE notes SET status = "top" WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/note/activate', adminAuthenticate, async (req, res) => {
  try {
    const { id } = req.body;
    await pool.query('UPDATE notes SET status = "active" WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats', adminAuthenticate, async (req, res) => {
  try {
    const [scenicStats] = await pool.query('SELECT SUM(view_count) as totalViews, COUNT(*) as totalScenic FROM scenic_spots');
    const [noteStats] = await pool.query('SELECT SUM(favorite_count) as totalFavorites, COUNT(*) as totalNotes FROM notes');
    const [userStats] = await pool.query('SELECT COUNT(*) as totalUsers FROM users');
    const [loginStats] = await pool.query('SELECT SUM(login_count) as totalLogins FROM user_stats');
    
    const [monthlyUsers] = await pool.query(`SELECT DATE_FORMAT(u.created_at, '%Y-%m') as month, COUNT(*) as count 
                                             FROM users u 
                                             WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH) 
                                             GROUP BY month 
                                             ORDER BY month`);
    
    const [monthlyLogins] = await pool.query(`SELECT DATE_FORMAT(us.last_login, '%Y-%m') as month, SUM(us.login_count) as count 
                                               FROM user_stats us 
                                               WHERE us.last_login >= DATE_SUB(NOW(), INTERVAL 6 MONTH) 
                                               GROUP BY month 
                                               ORDER BY month`);
    
    res.json({
      scenicViews: scenicStats[0].totalViews || 0,
      scenicCount: scenicStats[0].totalScenic || 0,
      noteFavorites: noteStats[0].totalFavorites || 0,
      noteCount: noteStats[0].totalNotes || 0,
      userCount: userStats[0].totalUsers || 0,
      loginCount: loginStats[0].totalLogins || 0,
      monthlyUsers: monthlyUsers,
      monthlyLogins: monthlyLogins
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;