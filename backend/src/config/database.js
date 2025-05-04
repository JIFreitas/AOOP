const mongoose = require('mongoose');
const setupIndexes = require('../models/setupIndexes');

/**
 * Configuração e conexão com o MongoDB
 * @returns {Promise} Promessa que resolve quando a conexão é estabelecida
 */
const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB conectado com sucesso');
    
    // Configurar índices após a conexão com o MongoDB
    await setupIndexes().catch(err => {
      console.error('Erro ao configurar índices:', err);
    });
    
    return connection;
  } catch (error) {
    console.error('Erro na conexão com MongoDB:', error.message);
    process.exit(1); // Encerra a aplicação em caso de falha na conexão
  }
};

module.exports = connectDB;