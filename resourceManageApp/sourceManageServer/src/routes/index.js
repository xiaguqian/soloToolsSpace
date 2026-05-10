const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const resourceRoutes = require('./resources');
const tagRoutes = require('./tags');

router.get('/health', (req, res) => {
  res.json({
    code: 200,
    message: 'Server is running',
    data: {
      timestamp: new Date().toISOString()
    }
  });
});

router.use('/auth', authRoutes);
router.use('/resources', resourceRoutes);
router.use('/tags', tagRoutes);

module.exports = router;
