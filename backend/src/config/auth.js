const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || 'MoviePlanetMySECRET',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '1d'
  },
  
  password: {
    saltRounds: 10 
  }
};

module.exports = authConfig;