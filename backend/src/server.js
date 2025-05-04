const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar configurações
const { connectDB, serverConfig } = require('./config');

const app = express();

// Middleware
app.use(cors(serverConfig.corsOptions));
app.use(express.json());

// Conectar ao MongoDB
connectDB()
  .then(() => {
    console.log('Conexão com o banco de dados estabelecida');
  })
  .catch(err => {
    console.error('Erro na inicialização do banco de dados:', err);
    process.exit(1);
  });

// Rota de status para verificar conexão
app.get('/api/status', (req, res) => {
  const mongoose = require('mongoose');
  res.json({ 
    status: 'online', 
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date()
  });
});

// Import routes
const movieRoutes = require('./routes/movieRoutes');
const commentRoutes = require('./routes/commentRoutes');
const authRoutes = require('./routes/authRoutes');

// Use routes
app.use('/api/movies', movieRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/auth', authRoutes);

// Import error handling middleware
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Apply error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(serverConfig.port, () => {
  console.log(`Servidor rodando na porta ${serverConfig.port}`);
});