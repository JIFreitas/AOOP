const movieService = require('../services/movieService');
const openRouterService = require('../services/openRouterService');

const analyzeMessageIntent = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Palavras-chave que indicam necessidade de buscar filmes
  const movieKeywords = [
    'filme', 'filmes', 'cinema', 'assistir', 'ver', 'recomenda', 'sugestão',
    'género', 'genero', 'ação', 'acção', 'comédia', 'drama', 'terror', 'ficção',
    'romance', 'aventura', 'animação', 'documentário', 'thriller', 'suspense',
    'anos', '198', '199', '200', '201', '202', // Anos
    'actor', 'actriz', 'realizador', 'director', 'elenco'
  ];

  const genreKeywords = [
    'ação', 'acção', 'action', 'comédia', 'comedy', 'drama', 'terror', 'horror',
    'romance', 'romântico', 'aventura', 'adventure', 'animação', 'animation',
    'documentário', 'documentary', 'thriller', 'suspense', 'ficção científica',
    'sci-fi', 'fantasia', 'fantasy', 'crime', 'guerra', 'war', 'western'
  ];

  const yearPattern = /\b(19|20)\d{2}\b/;
  
  const shouldFetch = movieKeywords.some(keyword => lowerMessage.includes(keyword));
  const hasGenre = genreKeywords.find(genre => lowerMessage.includes(genre));
  const hasYear = lowerMessage.match(yearPattern);

  return {
    shouldFetch,
    intent: determineIntent(lowerMessage),
    genre: hasGenre,
    year: hasYear ? hasYear[0] : null,
    isSearchQuery: lowerMessage.includes('procur') || lowerMessage.includes('encontr') || lowerMessage.includes('pesquis')
  };
};

const determineIntent = (message) => {
  if (message.includes('recomenda') || message.includes('sugest')) return 'recommendation';
  if (message.includes('procur') || message.includes('encontr')) return 'search';
  if (message.includes('melhor') || message.includes('top')) return 'top_movies';
  if (message.includes('género') || message.includes('genero')) return 'genre_query';
  if (message.includes('ano') || /\b(19|20)\d{2}\b/.test(message)) return 'year_query';
  return 'general';
};

const extractSearchTerms = (message) => {
  // Remove palavras de contexto para extrair termos de pesquisa
  const stopWords = ['filme', 'filmes', 'procuro', 'quero', 'gostaria', 'sobre', 'acerca', 'ver', 'assistir'];
  const words = message.toLowerCase().split(/\s+/);
  const filteredWords = words.filter(word => 
    word.length > 2 && 
    !stopWords.includes(word) &&
    !/^(um|uma|de|da|do|com|para|por)$/.test(word)
  );
  
  return filteredWords.length > 0 ? filteredWords.join(' ') : null;
};

const fetchRelevantMovieData = async (message, intent) => {
  try {
    switch (intent.intent) {
      case 'recommendation':
      case 'genre_query':
        if (intent.genre) {
          return await movieService.getMoviesByGenre(intent.genre);
        }
        return await movieService.getAllMovies({ limit: 8, sort: 'rating_desc' });

      case 'year_query':
        if (intent.year) {
          return await movieService.getMoviesByYear(intent.year);
        }
        break;

      case 'search':
        // Extrair termos de pesquisa da mensagem
        const searchTerms = extractSearchTerms(message);
        if (searchTerms) {
          return await movieService.searchMovies(searchTerms);
        }
        break;

      case 'top_movies':
        return await movieService.getAllMovies({ limit: 10, sort: 'rating_desc' });

      default:
        // Para consultas gerais, buscar filmes populares
        return await movieService.getAllMovies({ limit: 6, sort: 'rating_desc' });
    }
  } catch (error) {
    console.error('Erro ao buscar dados específicos:', error.message);
    throw error;
  }
};

const handleChatRequest = async (req, res) => {
  try {
    const { mensagem } = req.body;

    if (!mensagem || mensagem.trim() === '') {
      return res.status(400).json({
        erro: 'Mensagem é obrigatória'
      });
    }

    console.log(`📝 Nova pergunta: ${mensagem}`);

    // Analisar se precisa consultar a API de filmes
    const needsMovieData = analyzeMessageIntent(mensagem);
    let movieData = null;

    if (needsMovieData.shouldFetch) {
      try {
        movieData = await fetchRelevantMovieData(mensagem, needsMovieData);
        console.log(`🎬 Dados de filmes obtidos:`, movieData?.movies?.length || 0, 'filmes');
      } catch (error) {
        console.error('Erro ao buscar dados de filmes:', error.message);
        // Continua sem os dados - o chatbot pode responder baseado no conhecimento
      }
    }

    // Gerar resposta com IA
    const resposta = await openRouterService.generateResponse(mensagem, movieData);

    console.log(`✅ Resposta gerada com sucesso`);

    res.json({
      resposta: resposta.trim()
    });

  } catch (error) {
    console.error('Erro no chat:', error);
    res.status(500).json({
      erro: 'Desculpe, ocorreu um erro interno. Tente novamente em alguns instantes.',
      detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  handleChatRequest
};