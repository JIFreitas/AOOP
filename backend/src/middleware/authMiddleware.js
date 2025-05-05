const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');
const User = require('../models/User');
const Session = require('../models/Session');

// Middleware de autenticação que verifica o token JWT
const authenticate = async (req, res, next) => {
  // Obter o token do cabeçalho Authorization
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    // Se não houver token, negar acesso (para rotas protegidas)
    return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
  }
  
  try {
    // Verificar se o token é válido
    const decoded = jwt.verify(token, authConfig.jwt.secret);
    
    // Verificar se o token existe como uma sessão válida
    const session = await Session.findOne({
      jwt: token
    });
    
    if (!session) {
      // Se o token não corresponder a uma sessão válida, negar acesso
      return res.status(401).json({ message: 'Acesso negado. Sessão inválida ou expirada.' });
    }
    
    // Buscar o usuário no banco de dados usando userId do payload do token
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      // Se o usuário não existir, negar acesso
      return res.status(401).json({ message: 'Acesso negado. Usuário não encontrado.' });
    }
    
    // Adicionar o usuário à requisição
    req.user = user;
    req.userId = user._id.toString();
    
    // Continuar com a requisição
    next();
  } catch (error) {
    // Se houver erro na validação do token, negar acesso
    console.error('Token inválido:', error.message);
    res.status(401).json({ message: 'Acesso negado. Token inválido.' });
  }
};

// Middleware opcional que inclui informações do usuário se autenticado
// mas não bloqueia acesso para usuários não autenticados
const optionalAuth = async (req, res, next) => {
  // Obter o token do cabeçalho Authorization
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    // Se não houver token, continuar sem autenticação
    return next();
  }
  
  try {
    // Verificar se o token é válido
    const decoded = jwt.verify(token, authConfig.jwt.secret);
    
    // Verificar se o token existe como uma sessão válida
    const session = await Session.findOne({
      jwt: token
    });
    
    if (!session) {
      // Se o token não corresponder a uma sessão válida, continuar sem autenticação
      return next();
    }
    
    // Buscar o usuário no banco de dados usando userId do payload do token
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      // Se o usuário não existir, continuar sem autenticação
      return next();
    }
    
    // Adicionar o usuário à requisição
    req.user = user;
    req.userId = user._id.toString();
    
    // Continuar com a requisição
    next();
  } catch (error) {
    // Se houver erro na validação do token, continuar sem autenticação
    console.error('Token inválido:', error.message);
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth
};