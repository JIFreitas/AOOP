const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const config = require('./config');
const chatRoutes = require('./routes/chat');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// Middleware de segurança
app.use(helmet());

// CORS
app.use(cors({
  origin: '*', // Em produção, especificar domínios permitidos
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON
app.use(express.json({ limit: '10mb' }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rotas
app.use('/chatbot', chatRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    service: 'Movie Chatbot Service',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      chat: 'POST /chatbot',
      status: 'GET /chatbot/status'
    }
  });
});

// Middleware de erro
app.use(notFound);
app.use(errorHandler);

// Iniciar servidor
app.listen(config.port, () => {
  console.log(`🤖 Movie Chatbot Service rodando na porta ${config.port}`);
  console.log(`🎬 Conectado à API de filmes: ${config.movieApiBaseUrl}`);
  console.log(`🚀 Ambiente: ${config.nodeEnv}`);
});

module.exports = app;