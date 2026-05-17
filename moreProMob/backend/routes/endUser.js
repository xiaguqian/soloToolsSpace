const express = require('express');
const { getEndUsers, getEndUser, updateEndUser, addPoints } = require('../controllers/endUser');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, getEndUsers);
router.get('/:id', authenticate, getEndUser);
router.put('/:id', authenticate, updateEndUser);
router.post('/:id/points', authenticate, addPoints);

module.exports = router;