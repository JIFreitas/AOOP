const User = require('../models/User');
const Session = require('../models/Session');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Importar configurações de autenticação
const { authConfig } = require('../config');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Este e-mail já está registado'
      });
    }
    
    const user = new User({
      name,
      email,
      password
    });
    
    await user.save();
    
    const token = jwt.sign(
      { userId: user._id },
      authConfig.jwt.secret,
      { expiresIn: authConfig.jwt.expiresIn }
    );
    
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
      message: 'Erro ao registar utilizador',
      error: err.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'E-mail ou palavra-passe incorretos'
      });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'E-mail ou palavra-passe incorretos'
      });
    }
    
    const token = jwt.sign(
      { userId: user._id },
      authConfig.jwt.secret,
      { expiresIn: authConfig.jwt.expiresIn }
    );
    
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
      message: 'Erro ao iniciar sessão',
      error: err.message
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizador não encontrado'
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
      message: 'Erro ao procurar dados do utilizador',
      error: err.message
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizador não encontrado'
      });
    }
    
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
    
    if (name) {
      user.name = name;
    }
    
    if (currentPassword && newPassword) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Palavra-passe atual incorreta'
        });
      }
      
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
      message: 'Erro ao atualizar utilizador',
      error: err.message
    });
  }
};

exports.logout = async (req, res) => {
  try {
    const { token } = req.body;
    
    await Session.findOneAndDelete({ jwt: token });
    
    res.json({
      success: true,
      message: 'Sessão terminada com sucesso'
    });
    
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Erro ao terminar sessão',
      error: err.message
    });
  }
};