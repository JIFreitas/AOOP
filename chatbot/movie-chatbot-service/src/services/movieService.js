const axios = require('axios');
const config = require('../config');

class MovieService {
  constructor() {
    this.baseURL = config.movieApiBaseUrl;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async getAllMovies(params = {}) {
    try {
      const response = await this.client.get('/movies', { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar filmes:', error.message);
      throw new Error('Não foi possível buscar filmes no momento');
    }
  }

  async getMovieById(id) {
    try {
      const response = await this.client.get(`/movies/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar filme ${id}:`, error.message);
      throw new Error('Filme não encontrado');
    }
  }

  async getGenres() {
    try {
      const response = await this.client.get('/movies/genres');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar géneros:', error.message);
      throw new Error('Não foi possível buscar géneros');
    }
  }

  async searchMovies(query, filters = {}) {
    try {
      const params = {
        search: query,
        limit: 10,
        ...filters
      };
      const response = await this.client.get('/movies', { params });
      return response.data;
    } catch (error) {
      console.error('Erro na pesquisa de filmes:', error.message);
      throw new Error('Erro na pesquisa de filmes');
    }
  }

  async getMoviesByGenre(genre, limit = 5) {
    try {
      const params = {
        genre: genre,
        limit: limit,
        sort: 'rating_desc'
      };
      const response = await this.client.get('/movies', { params });
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar filmes do género ${genre}:`, error.message);
      throw new Error(`Não foi possível buscar filmes do género ${genre}`);
    }
  }

  async getMoviesByYear(year, limit = 5) {
    try {
      const params = {
        search: year.toString(),
        limit: limit,
        sort: 'rating_desc'
      };
      const response = await this.client.get('/movies', { params });
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar filmes do ano ${year}:`, error.message);
      throw new Error(`Não foi possível buscar filmes do ano ${year}`);
    }
  }
}

module.exports = new MovieService();