const axios = require('axios');
const config = require('../config');

class OpenRouterService {
  constructor() {
    this.client = axios.create({
      baseURL: 'https://openrouter.ai/api/v1',
      headers: {
        'Authorization': `Bearer ${config.openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://movie-chatbot-service.com',
        'X-Title': 'Movie Chatbot Service'
      },
      timeout: 30000
    });
  }

  async generateResponse(userMessage, movieData = null) {
    try {
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(userMessage, movieData);

      const response = await this.client.post('/chat/completions', {
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 800,
        temperature: 0.7
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Erro no OpenRouter:', error.response?.data || error.message);
      throw new Error('Não foi possível gerar resposta no momento');
    }
  }

  buildSystemPrompt() {
    return `És um assistente de filmes entusiasta e amigável do MoviePlanet. O teu objetivo é ajudar utilizadores a descobrir filmes incríveis!

🎬 FORMATO DE RESPOSTA - MUITO IMPORTANTE:
- SEMPRE responde em HTML bem formatado
- Usa tags HTML para estruturar a resposta de forma visual
- Exemplo de estrutura HTML:
  <div>
    <h4>🎬 Recomendações:</h4>
    <ul>
      <li><strong><a href="https://aoop-frontend.onrender.com/movie/[ID]" target="_blank">Título (Ano)</a></strong> - Descrição breve</li>
    </ul>
    <div style="margin-top: 15px; padding: 10px; background: #f8f9fa; border-radius: 8px;">
      <strong>💡 Outras perguntas:</strong><br>
      <em>"Pergunta sugerida 1?"</em> | <em>"Pergunta sugerida 2?"</em>
    </div>
  </div>

    ESTILO DE RESPOSTA:
- Respostas curtas e diretas (máximo 2-3 parágrafos)
- Tom conversacional e entusiasta
- Resposta na mesma língua do utilizador utilizou na resposta
- NUNCA menciones aspectos técnicos ou "base de dados"

    LINKS PARA FILMES:
- SEMPRE que recomendares um filme específico, usa: https://aoop-frontend.onrender.com/movie/[ID_DO_FILME]
- Formato HTML: <a href="https://aoop-frontend.onrender.com/movie/[ID]" target="_blank">Título (Ano)</a>

    QUANDO RECEBERES DADOS DE FILMES:
- Usa informações específicas (título, ano, género, avaliação IMDB)
- Recomenda entre 3-5 filmes máximo em lista HTML
- Inclui sempre os links clicáveis
- Destaca pontos únicos de cada filme

    QUANDO NÃO TIVERES DADOS:
- Responde com conhecimento geral sobre cinema
- Usa listas HTML para organizar sugestões
- Faz perguntas para refinar a pesquisa
- Mantém-te positivo e útil

    SUGESTÕES AUTOMÁTICAS:
- SEMPRE inclui 2-3 perguntas relacionadas no final
- Usa uma div cinzenta para destacar as sugestões
- Formato em itálico e separado por |

Sê como um amigo conhecedor de cinema que adora partilhar descobertas!`;
  }

  buildUserPrompt(userMessage, movieData) {
    let prompt = `Pergunta: "${userMessage}"`;

    if (movieData && movieData.movies && movieData.movies.length > 0) {
      prompt += `\n\nFilmes disponíveis para recomendação:\n`;
      
      movieData.movies.forEach(movie => {
        prompt += `\n• ${movie.title} (${movie.year || 'N/A'})`;
        prompt += `\n  ID: ${movie._id}`;
        prompt += `\n  Géneros: ${movie.genres ? movie.genres.join(', ') : 'N/A'}`;
        prompt += `\n  IMDB: ${movie.imdb && movie.imdb.rating ? movie.imdb.rating + '/10' : 'N/A'}`;
        if (movie.plot) {
          prompt += `\n  Sinopse: ${movie.plot.substring(0, 150)}...`;
        }
        prompt += `\n`;
      });

      prompt += `\n IMPORTANTE: Para cada filme que recomendares, usa este formato exato:`;
      prompt += `\n[Título do Filme](https://aoop-frontend.onrender.com/movie/[ID_DO_FILME])`;
      prompt += `\nExemplo: [Inception](https://aoop-frontend.onrender.com/movie/573a1390f29313caabcd4135)`;
      
      prompt += `\n\n   INSTRUÇÕES CRÍTICAS:`;
      prompt += `\n- SÊ DIRETO e NATURAL - como se fosses um amigo a recomendar filmes`;
      prompt += `\n- NUNCA fales sobre "base de dados", "pesquisas" ou aspectos técnicos`;
      prompt += `\n- Recomenda 3-4 filmes máximo com links clicáveis`;
      prompt += `\n- Usa máximo 2-3 parágrafos curtos`;
      prompt += `\n- Termina com 2 sugestões de perguntas`;
    } else {
      prompt += `\n\nNão tenho dados específicos agora.`;
      prompt += `\n\n   INSTRUÇÕES:`;
      prompt += `\n- Responde com conhecimento geral sobre cinema`;
      prompt += `\n- SÊ NATURAL - nunca menciones limitações técnicas`;
      prompt += `\n- Sugere filmes conhecidos do género/tema pedido`;
      prompt += `\n- Máximo 2-3 parágrafos`;
      prompt += `\n- Termina com 2 sugestões de perguntas`;
    }

    return prompt;
  }
}

module.exports = new OpenRouterService();