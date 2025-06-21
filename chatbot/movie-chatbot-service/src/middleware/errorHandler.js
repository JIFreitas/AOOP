const errorHandler = (err, req, res, next) => {
  console.error('Erro capturado:', err);

  // Erro de validação
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      erro: 'Dados inválidos',
      detalhes: err.message
    });
  }

  // Erro de timeout
  if (err.code === 'ECONNABORTED') {
    return res.status(408).json({
      erro: 'Timeout na requisição. Tente novamente.'
    });
  }

  // Erro genérico
  res.status(500).json({
    erro: 'Erro interno do servidor',
    detalhes: process.env.NODE_ENV === 'development' ? err.message : 'Tente novamente mais tarde'
  });
};

const notFound = (req, res) => {
  res.status(404).json({
    erro: 'Endpoint não encontrado',
    disponíveis: {
      chat: 'POST /chatbot',
      status: 'GET /chatbot/status'
    }
  });
};

module.exports = {
  errorHandler,
  notFound
};