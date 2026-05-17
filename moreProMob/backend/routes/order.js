const express = require('express');
const { getOrders, getOrder, updateOrder, exportOrders } = require('../controllers/order');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, getOrders);
router.get('/:id', authenticate, getOrder);
router.put('/:id', authenticate, updateOrder);
router.get('/export', authenticate, exportOrders);

module.exports = router;