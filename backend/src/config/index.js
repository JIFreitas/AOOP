/**
 * Exportações de todas as configurações
 */
const connectDB = require('./database');
const serverConfig = require('./server');
const authConfig = require('./auth');

module.exports = {
  connectDB,
  serverConfig,
  authConfig
};