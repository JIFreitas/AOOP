const express = require('express');
const router = express.Router();
const { handleChatRequest } = require('../controllers/chatController');
const { validateChatRequest } = require('../middleware/validation');

// Endpoint principal do chatbot
router.post('/', validateChatRequest, handleChatRequest);

// Endpoint de status para verificar se o serviço está funcionando
router.get('/status', (req, res) => {
  res.json({
    status: 'online',
    service: 'Movie Chatbot Service',
    timestamp: new Date().toISOString(),
    endpoints: {
      chat: 'POST /chatbot',
      status: 'GET /chatbot/status'
    }
  });
});

module.exports = router;