const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { clothesImages, personImages, galleryImages } = req.body;
    
    const generatedImages = [
      'https://example.com/outfit-1.jpg',
      'https://example.com/outfit-2.jpg',
      'https://example.com/outfit-3.jpg'
    ];
    
    res.json({ images: generatedImages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;