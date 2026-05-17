const express = require('express');
const { getDashboard, getOrderTrend, getProductRanking } = require('../controllers/statistics');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', authenticate, getDashboard);
router.get('/order-trend', authenticate, getOrderTrend);
router.get('/product-ranking', authenticate, getProductRanking);

module.exports = router;