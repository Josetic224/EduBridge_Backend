const express = require('express');
const router = express.Router();
const socketController = require('../../controllers/socket.controller');
const { isAuthenticated } = require('../../middlewares/auth');

// Test endpoint to simulate socket message with authentication
router.post('/test-message', socketController.testSocketMessage);

module.exports = router;
