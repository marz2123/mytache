const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Authentifier un utilisateur
router.post('/login', authController.login);

module.exports = router; 