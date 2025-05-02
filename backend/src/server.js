const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB:', err));

// Rota de status para verificar conexão
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'online', 
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date()
  });
});

// Import routes
const movieRoutes = require('./routes/movieRoutes');
const commentRoutes = require('./routes/commentRoutes');

// Use routes
app.use('/api/movies', movieRoutes);
app.use('/api/comments', commentRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});