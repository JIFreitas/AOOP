const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

// Rotas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Rotas protegidas
router.get('/me', authenticate, authController.getMe);
router.put('/update', authenticate, authController.updateUser);

module.exports = router;