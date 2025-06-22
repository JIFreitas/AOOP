/**
 * Configurações do servidor
 */
const serverConfig = {
  port: process.env.PORT || 5000,
  
  corsOptions: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
};

module.exports = serverConfig;