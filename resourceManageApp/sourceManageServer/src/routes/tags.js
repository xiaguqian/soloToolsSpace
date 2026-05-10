const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const { authenticate } = require('../middlewares/auth');

router.post('/', authenticate, tagController.createTag);

router.get('/', authenticate, tagController.getTagList);

router.put('/:tagId', authenticate, tagController.updateTag);

router.delete('/:tagId', authenticate, tagController.deleteTag);

router.post('/batch', authenticate, tagController.batchTagResources);

router.delete('/resources/:resourceId/tags/:tagId', authenticate, tagController.removeTagFromResource);

router.get('/resources/:resourceId', authenticate, tagController.getTagsByResource);

module.exports = router;
