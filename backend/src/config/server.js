/**
 * Configurações do servidor
 */
const serverConfig = {
  // Configuração da porta
  port: process.env.PORT || 5000,
  
  // Configurações de CORS
  corsOptions: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
};

module.exports = serverConfig;