class ResponseFormatter {
  static formatSuccess(resposta, metadata = null) {
    const response = {
      resposta: resposta,
      timestamp: new Date().toISOString(),
      status: 'success'
    };

    if (metadata) {
      response.metadata = metadata;
    }

    return response;
  }

  static formatError(error, status = 500) {
    return {
      erro: typeof error === 'string' ? error : error.message,
      timestamp: new Date().toISOString(),
      status: 'error'
    };
  }

  static formatMovieResponse(resposta, filmes = null) {
    const response = this.formatSuccess(resposta);
    
    if (filmes && filmes.length > 0) {
      response.metadata = {
        totalFilmes: filmes.length,
        fonte: 'MoviePlanet API'
      };
    }

    return response;
  }
}

module.exports = ResponseFormatter;