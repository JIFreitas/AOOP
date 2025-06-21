const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  port: process.env.PORT || 3001,
  openRouterApiKey: process.env.OPENROUTER_API_KEY,
  movieApiBaseUrl: process.env.MOVIE_API_BASE_URL || 'https://aoop-q9ib.onrender.com/api',
  nodeEnv: process.env.NODE_ENV || 'development'
};