const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Por favor, informe um email válido']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para criptografar a password antes de salvar
userSchema.pre('save', async function(next) {
  const user = this;
  
  // Só hash a password se foi modificada (ou é nova)
  if (!user.isModified('password')) return next();
  
  try {
    // Gerar salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash da password com o salt
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Atualizar timestamp ao editar
userSchema.pre('updateOne', function() {
  this.update({}, { $set: { updatedAt: new Date() } });
});

const User = mongoose.model('User', userSchema, 'users');

module.exports = User;