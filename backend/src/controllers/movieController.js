const Movie = require('../models/Movie');
const mongoose = require('mongoose');

// Get all movies with pagination and search
exports.getMovies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchQuery = req.query.search || '';
    const genre = req.query.genre || '';
    const sort = req.query.sort || 'title_asc';
    
    let query = {};
    
    if (searchQuery) {
      query = { 
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { plot: { $regex: searchQuery, $options: 'i' } },
          { directors: { $regex: searchQuery, $options: 'i' } },
          { cast: { $regex: searchQuery, $options: 'i' } }
        ]
      };
    }
    
    if (genre) {
      query.genres = { $regex: genre, $options: 'i' };
    }

    // Configurar a ordenação com base no parâmetro sort
    let sortConfig = { title: 1 }; // Padrão: título em ordem crescente
    
    // Adicionar filtro adicional para filmes com avaliação se estiver ordenando por avaliação
    if (sort === 'rating_asc' || sort === 'rating_desc') {
      // Garantir que apenas filmes com avaliação do IMDB sejam incluídos
      query['imdb.rating'] = { $exists: true, $ne: null, $gt: 0 };
      query['imdb'] = { $exists: true, $ne: null };
    }
    
    switch(sort) {
      case 'title_asc':
        sortConfig = { title: 1 };
        break;
      case 'title_desc':
        sortConfig = { title: -1 };
        break;
      case 'year_asc':
        sortConfig = { year: 1 };
        break;
      case 'year_desc':
        sortConfig = { year: -1 };
        break;
      case 'rating_asc':
        sortConfig = { 'imdb.rating': 1 };
        break;
      case 'rating_desc':
        sortConfig = { 'imdb.rating': -1 };
        break;
      default:
        sortConfig = { title: 1 };
    }

    // Usar a conexão nativa do MongoDB para ter mais controle
    const db = mongoose.connection;
    const collection = db.collection('movies');
    
    // Contagem total para paginação
    const total = await collection.countDocuments(query);
    
    // IMPORTANTE: Reordenando o pipeline para colocar $match e $sort no início,
    // antes de $skip e $limit, para melhor aproveitamento dos índices
    const movies = await collection.aggregate([
      { $match: query },  // Primeiro filtramos os documentos
      { $sort: sortConfig }, // Em seguida, ordenamos (usando índices)
      { $skip: skip },      // Depois pulamos os docs para paginação
      { $limit: limit }     // Por fim, limitamos o número retornado
    ], { "allowDiskUse": true }).toArray();
    
    res.json({
      movies,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error('Erro na busca de filmes:', err);
    res.status(500).json({ 
      message: 'Erro ao buscar filmes',
      error: err.message 
    });
  }
};

// Get a single movie by ID
exports.getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Filme não encontrado' });
    }
    res.json(movie);
  } catch (err) {
    res.status(500).json({ 
      message: 'Erro ao buscar filme',
      error: err.message 
    });
  }
};

// Get genres list
exports.getGenres = async (req, res) => {
  try {
    const genres = await Movie.distinct('genres');
    // Ordenar gêneros alfabeticamente
    genres.sort();
    res.json(genres);
  } catch (err) {
    res.status(500).json({ 
      message: 'Erro ao buscar gêneros',
      error: err.message 
    });
  }
};