/**
 * Configurações relacionadas à autenticação
 */
const authConfig = {
  // Configurações de JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'sua_chave_secreta_padrao',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  
  // Configurações de senha
  password: {
    saltRounds: 10 // Número de rounds para o bcrypt
  }
};

module.exports = authConfig;