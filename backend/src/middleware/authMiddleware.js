const jwt = require('jsonwebtoken');
const Session = require('../models/Session');

// Importar configurações de autenticação
const { authConfig } = require('../config');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acesso negado. Nenhum token fornecido.'
      });
    }
    
    const session = await Session.findOne({ jwt: token });
    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Sessão inválida ou expirada. Por favor, inicie sessão novamente.'
      });
    }
    
    const decoded = jwt.verify(token, authConfig.jwt.secret);
    
    req.userId = decoded.userId;
    req.token = token;
    
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido. Por favor, inicie sessão novamente.'
      });
    } else if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'A sua sessão expirou. Por favor, inicie sessão novamente.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro na autenticação.',
      error: err.message
    });
  }
};