// server/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Check if the controller method exists
if (typeof authController.googleLogin !== 'function') {
    console.error('Warning: authController.googleLogin is not a function');
}

// Define the route
router.post('/google-login', (req, res) => {
    authController.googleLogin(req, res);
});

module.exports = router;