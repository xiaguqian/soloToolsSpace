const express = require('express');
const { getTenantInfo, updateTenantInfo, getStaffList, createStaff, updateStaff, deleteStaff } = require('../controllers/system');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/tenant', authenticate, getTenantInfo);
router.put('/tenant', authenticate, updateTenantInfo);
router.get('/staff', authenticate, getStaffList);
router.post('/staff', authenticate, createStaff);
router.put('/staff/:id', authenticate, updateStaff);
router.delete('/staff/:id', authenticate, deleteStaff);

module.exports = router;