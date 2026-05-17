const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');

router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { scenicId, scenicImages, outfitImages, galleryImages } = req.body;
    
    const generatedImages = [
      'https://example.com/smart-travel-1.jpg',
      'https://example.com/smart-travel-2.jpg',
      'https://example.com/smart-travel-3.jpg'
    ];
    
    res.json({ images: generatedImages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;