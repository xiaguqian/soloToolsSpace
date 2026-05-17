const express = require('express');
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, updateStatus, getCategories } = require('../controllers/product');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, getProducts);
router.get('/:id', authenticate, getProduct);
router.post('/', authenticate, createProduct);
router.put('/:id', authenticate, updateProduct);
router.delete('/:id', authenticate, deleteProduct);
router.put('/:id/status', authenticate, updateStatus);
router.get('/categories/list', authenticate, getCategories);

module.exports = router;