const jwt = require('jsonwebtoken');
const Session = require('../models/Session');

// Chave secreta para JWT
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_jwt';

exports.authenticate = async (req, res, next) => {
  try {
    // Verificar se o token existe no header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acesso negado. Nenhum token fornecido.'
      });
    }
    
    // Verificar se a sessão existe
    const session = await Session.findOne({ jwt: token });
    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Sessão inválida ou expirada. Por favor, faça login novamente.'
      });
    }
    
    // Verificar e decodificar o token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Adicionar o ID do usuário ao objeto de requisição
    req.userId = decoded.userId;
    req.token = token;
    
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido. Por favor, faça login novamente.'
      });
    } else if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Sua sessão expirou. Por favor, faça login novamente.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro na autenticação.',
      error: err.message
    });
  }
};