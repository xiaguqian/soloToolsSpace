const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, requireSystemUser } = require('../middlewares/auth');

router.post('/login', authController.login);

router.post('/register', authController.register);

router.post('/system-users', authenticate, requireSystemUser, authController.createSystemUser);

router.get('/me', authenticate, authController.getCurrentUser);

router.put('/password', authenticate, authController.changePassword);

router.put('/password/reset', authenticate, requireSystemUser, authController.resetPassword);

module.exports = router;
