const User = require('../models/User');
const Session = require('../models/Session');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Chave secreta para JWT - em produção usar variável de ambiente
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_jwt';

// Registrar um novo usuário
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Verificar se o usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Este e-mail já está registrado'
      });
    }
    
    // Criar novo usuário
    const user = new User({
      name,
      email,
      password
    });
    
    await user.save();
    
    // Gerar token JWT
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Criar sessão
    const session = new Session({
      user_id: user._id,
      jwt: token
    });
    
    await session.save();
    
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        token
      }
    });
    
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar usuário',
      error: err.message
    });
  }
};

// Login de usuário
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Verificar se o usuário existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'E-mail ou password incorretos'
      });
    }
    
    // Verificar password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'E-mail ou password incorretos'
      });
    }
    
    // Gerar token JWT
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Criar sessão
    const session = new Session({
      user_id: user._id,
      jwt: token
    });
    
    await session.save();
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        token
      }
    });
    
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer login',
      error: err.message
    });
  }
};

// Obter dados do usuário autenticado
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        }
      }
    });
    
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar dados do usuário',
      error: err.message
    });
  }
};

// Atualizar dados do usuário
exports.updateUser = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    
    // Verificar se o usuário existe
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    // Se estiver alterando o e-mail, verificar se já está em uso
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Este e-mail já está em uso'
        });
      }
      user.email = email;
    }
    
    // Atualizar nome se fornecido
    if (name) {
      user.name = name;
    }
    
    // Atualizar password se fornecida
    if (currentPassword && newPassword) {
      // Verificar password atual
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Password atual incorreta'
        });
      }
      
      // Atualizar para nova password
      user.password = newPassword;
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      }
    });
    
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar usuário',
      error: err.message
    });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    const { token } = req.body;
    
    // Remover sessão
    await Session.findOneAndDelete({ jwt: token });
    
    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
    
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer logout',
      error: err.message
    });
  }
};