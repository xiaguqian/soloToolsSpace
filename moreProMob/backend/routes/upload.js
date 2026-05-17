const express = require('express');
const upload = require('../middleware/multer');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ code: 400, message: '请选择文件' });
  }
  
  res.json({
    code: 200,
    data: {
      url: `/uploads/${req.user.tenant_id}/${req.file.filename}`
    }
  });
});

module.exports = router;