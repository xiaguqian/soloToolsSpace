const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const authenticateToken = require('../middleware/auth');

router.get('/list', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, scenicId, userId } = req.query;
    const offset = (page - 1) * pageSize;
    
    let query = `SELECT n.id, n.title, n.cover_image as coverImage, u.nickname as author, 
                  u.avatar as authorAvatar, n.scenic_id as scenicId, s.name as scenicName,
                  n.like_count as likeCount, n.comment_count as commentCount, 
                  n.favorite_count as favoriteCount, n.created_at as createTime
                  FROM notes n 
                  JOIN users u ON n.author_id = u.id 
                  LEFT JOIN scenic_spots s ON n.scenic_id = s.id
                  WHERE n.status IN ('active', 'top')`;
    let params = [];

    if (scenicId) {
      query += ' AND n.scenic_id = ?';
      params.push(scenicId);
    }
    if (userId) {
      query += ' AND n.author_id = ?';
      params.push(userId);
    }

    query += ' ORDER BY n.status = "top" DESC, n.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), parseInt(offset));

    const [notes] = await pool.query(query, params);
    
    res.json({ list: notes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [notes] = await pool.query(`SELECT n.id, n.title, n.content, n.cover_image as coverImage, 
                                      u.nickname as author, u.avatar as authorAvatar, 
                                      n.scenic_id as scenicId, s.name as scenicName,
                                      n.like_count as likeCount, n.comment_count as commentCount, 
                                      n.favorite_count as favoriteCount, n.created_at as createTime
                                      FROM notes n 
                                      JOIN users u ON n.author_id = u.id 
                                      LEFT JOIN scenic_spots s ON n.scenic_id = s.id
                                      WHERE n.id = ? AND n.status IN ('active', 'top')`, [id]);
    
    if (notes.length === 0) {
      return res.status(404).json({ error: '笔记不存在' });
    }
    
    const note = notes[0];
    
    const [images] = await pool.query('SELECT image_url as url FROM note_images WHERE note_id = ?', [id]);

    res.json({
      ...note,
      images: images.map(img => img.url)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { title, content, scenicId, images } = req.body;
    const authorId = req.user.id;
    
    const [result] = await pool.query('INSERT INTO notes (title, content, author_id, scenic_id, cover_image) VALUES (?, ?, ?, ?, ?)', 
      [title, content, authorId, scenicId || null, images && images.length > 0 ? images[0] : null]);
    
    const noteId = result.insertId;
    
    if (images && images.length > 0) {
      for (const img of images) {
        await pool.query('INSERT INTO note_images (note_id, image_url) VALUES (?, ?)', [noteId, img]);
      }
    }
    
    res.json({ id: noteId, title });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/favorite', authenticateToken, async (req, res) => {
  try {
    const { noteId } = req.body;
    const userId = req.user.id;
    
    await pool.query('INSERT INTO favorites (user_id, type, target_id) VALUES (?, ?, ?)', [userId, 'note', noteId]);
    await pool.query('UPDATE notes SET favorite_count = favorite_count + 1 WHERE id = ?', [noteId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/unfavorite', authenticateToken, async (req, res) => {
  try {
    const { noteId } = req.body;
    const userId = req.user.id;
    
    await pool.query('DELETE FROM favorites WHERE user_id = ? AND type = ? AND target_id = ?', [userId, 'note', noteId]);
    await pool.query('UPDATE notes SET favorite_count = favorite_count - 1 WHERE id = ?', [noteId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;