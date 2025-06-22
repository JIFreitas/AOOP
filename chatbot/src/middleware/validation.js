const validateChatRequest = (req, res, next) => {
  const { mensagem } = req.body;

  if (!mensagem) {
    return res.status(400).json({
      erro: 'Campo "mensagem" é obrigatório'
    });
  }

  if (typeof mensagem !== 'string') {
    return res.status(400).json({
      erro: 'Campo "mensagem" deve ser uma string'
    });
  }

  if (mensagem.trim().length === 0) {
    return res.status(400).json({
      erro: 'Mensagem não pode estar vazia'
    });
  }

  if (mensagem.length > 1000) {
    return res.status(400).json({
      erro: 'Mensagem muito longa (máximo 1000 caracteres)'
    });
  }

  next();
};

module.exports = {
  validateChatRequest
};