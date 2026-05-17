const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authenticateToken = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

router.post('/register', async (req, res) => {
  try {
    const { nickname, password } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.query('INSERT INTO users (nickname, password) VALUES (?, ?)', [nickname, hashedPassword]);
    
    const token = jwt.sign({ id: result.insertId, role: 'user' }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    
    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { nickname, password } = req.body;
    
    const [users] = await pool.query('SELECT * FROM users WHERE nickname = ?', [nickname]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    
    await pool.query(`INSERT INTO user_stats (user_id, login_count, last_login) 
                      VALUES (?, 1, NOW()) 
                      ON DUPLICATE KEY UPDATE login_count = login_count + 1, last_login = NOW()`, [user.id]);
    
    res.json({ success: true, token, role: user.role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/info', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [users] = await pool.query('SELECT id, nickname, avatar, bio FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    const user = users[0];
    
    const [galleryCount] = await pool.query('SELECT COUNT(*) as count FROM gallery WHERE user_id = ?', [userId]);
    const [favoriteCount] = await pool.query('SELECT COUNT(*) as count FROM favorites WHERE user_id = ?', [userId]);
    const [planCount] = await pool.query('SELECT COUNT(*) as count FROM plans WHERE user_id = ?', [userId]);
    const [noteCount] = await pool.query('SELECT COUNT(*) as count FROM notes WHERE author_id = ?', [userId]);
    
    res.json({
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      bio: user.bio,
      galleryCount: galleryCount[0].count,
      favoriteCount: favoriteCount[0].count,
      planCount: planCount[0].count,
      noteCount: noteCount[0].count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;