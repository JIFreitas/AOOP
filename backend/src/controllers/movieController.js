const Movie = require('../models/Movie');

// Get all movies with pagination and search
exports.getMovies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchQuery = req.query.search || '';
    const genre = req.query.genre || '';
    
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

    const movies = await Movie.find(query)
      .sort({ title: 1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Movie.countDocuments(query);
    
    res.json({
      movies,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
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
    res.json(genres);
  } catch (err) {
    res.status(500).json({ 
      message: 'Erro ao buscar gêneros',
      error: err.message 
    });
  }
};