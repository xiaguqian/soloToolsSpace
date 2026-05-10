const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const { authenticate, optionalAuth } = require('../middlewares/auth');
const { upload } = require('../middlewares/multer');

router.post('/upload', authenticate, upload.single('file'), resourceController.uploadSingleFile);

router.post('/upload/batch', authenticate, upload.array('files'), resourceController.uploadBatchFiles);

router.get('/tags', authenticate, resourceController.getResourceListByTags);

router.get('/:fileId', optionalAuth, resourceController.getResourceInfo);

router.get('/:fileId/download', optionalAuth, resourceController.downloadFile);

router.get('/:fileId/preview', optionalAuth, resourceController.previewFile);

router.delete('/:fileId', authenticate, resourceController.deleteResource);

module.exports = router;
