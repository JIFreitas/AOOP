const Movie = require('../models/Movie');
const UserMovieList = require('../models/UserMovieList');
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

    const db = mongoose.connection;
    const collection = db.collection('movies');
    
    const total = await collection.countDocuments(query);
    
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

// Get all movies with pagination, search, and user list type
exports.getAllMovies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const genre = req.query.genre || '';
    const sort = req.query.sort || 'title_asc';
    const userListType = req.query.userListType || '';

    const query = {};
    const sortOptions = {};

    // Configurar ordenação
    switch (sort) {
      case 'title_asc':
        sortOptions.title = 1;
        break;
      case 'title_desc':
        sortOptions.title = -1;
        break;
      case 'year_asc':
        sortOptions.year = 1;
        break;
      case 'year_desc':
        sortOptions.year = -1;
        break;
      case 'rating_asc':
        sortOptions['imdb.rating'] = 1;
        break;
      case 'rating_desc':
        sortOptions['imdb.rating'] = -1;
        break;
      default:
        sortOptions.title = 1;
    }

    // Aplicar filtro de busca
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { plot: { $regex: search, $options: 'i' } },
        { directors: { $regex: search, $options: 'i' } },
        { cast: { $regex: search, $options: 'i' } },
      ];
    }

    // Aplicar filtro de gênero
    if (genre) {
      query.genres = genre;
    }

    // Filtrar por lista do usuário se o usuário estiver autenticado e especificou userListType
    if (userListType && req.user) {
      try {
        // Primeiro, obter os IDs dos filmes na lista especificada do usuário
        const userMovieList = await UserMovieList.find({
          user_id: req.user._id,
          [userListType]: true
        });
        
        if (userMovieList && userMovieList.length > 0) {
          // Extrair os IDs dos filmes da lista
          const movieIds = userMovieList.map(item => new mongoose.Types.ObjectId(item.movie_id));
          
          // Adicionar condição para mostrar apenas os filmes nesta lista
          if (movieIds.length > 0) {
            query._id = { $in: movieIds };
          } else {
            // Se não houver filmes nesta lista, retornar array vazio
            return res.json({
              movies: [],
              currentPage: page,
              totalPages: 0,
              total: 0
            });
          }
        } else {
          // Se não houver filmes nesta lista, retornar array vazio
          return res.json({
            movies: [],
            currentPage: page,
            totalPages: 0,
            total: 0
          });
        }
      } catch (err) {
        console.error("Erro ao buscar lista de filmes do usuário:", err);
        // Em caso de erro, continuamos com a query sem o filtro de lista
      }
    }

    // Contar o total de resultados
    const total = await Movie.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Buscar filmes
    const movies = await Movie.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    res.json({
      movies,
      currentPage: page,
      totalPages,
      total
    });
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ message: 'Erro ao buscar filmes', error: process.env.NODE_ENV === 'production' ? '🥞' : error.stack });
  }
};

// Get movies with user list status (favorites, watched, watchlist)
exports.getMoviesWithUserStatus = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const genre = req.query.genre || '';
    const sort = req.query.sort || 'year_desc';
    const userListType = req.query.userListType || '';

    const query = {};
    const sortOptions = {};

    // Configurar ordenação
    switch (sort) {
      case 'title_asc':
        sortOptions.title = 1;
        break;
      case 'title_desc':
        sortOptions.title = -1;
        break;
      case 'year_asc':
        sortOptions.year = 1;
        break;
      case 'year_desc':
        sortOptions.year = -1;
        break;
      case 'rating_asc':
        sortOptions['imdb.rating'] = 1;
        break;
      case 'rating_desc':
        sortOptions['imdb.rating'] = -1;
        break;
      default:
        sortOptions.title = 1;
    }

    // Aplicar filtro de busca
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { plot: { $regex: search, $options: 'i' } },
        { directors: { $regex: search, $options: 'i' } },
        { cast: { $regex: search, $options: 'i' } },
      ];
    }

    // Aplicar filtro de gênero
    if (genre) {
      query.genres = genre;
    }

    // Filmes que correspondem aos filtros de lista do usuário
    if (userListType && req.user) {
      // Obtém os IDs de filmes da lista especificada
      const userMovieLists = await UserMovieList.find({
        user_id: req.user._id,
        list_type: userListType
      });
      
      if (userMovieLists.length === 0) {
        return res.json({
          movies: [],
          currentPage: page,
          totalPages: 0,
          total: 0
        });
      }
      
      const filteredMovieIds = userMovieLists.map(item => new mongoose.Types.ObjectId(item.movie_id));
      query._id = { $in: filteredMovieIds };
    }

    // Contar o total de resultados
    const total = await Movie.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Buscar filmes
    let movies = await Movie.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean(); // Usando lean() para obter objetos JavaScript simples que podemos modificar

    // Se usuário estiver autenticado, adicionar status de listas aos filmes
    if (req.user) {
      // Buscar todas as listas do usuário para os filmes retornados
      const movieIds = movies.map(movie => movie._id.toString());
      
      // Buscar todos os registros de listas para o usuário atual e os filmes atuais
      const userMovieLists = await UserMovieList.find({
        user_id: req.user._id,
        movie_id: { $in: movieIds }
      }).lean();
      
      // Inicializar o mapa de status de listas para todos os filmes
      const movieListsMap = {};
      movieIds.forEach(movieId => {
        movieListsMap[movieId] = {
          favorite: false,
          watched: false,
          watchlist: false
        };
      });
      
      // Atualizar o mapa com base nos registros de lista encontrados
      userMovieLists.forEach(list => {
        const movieId = list.movie_id.toString();
        const listType = list.list_type;
        
        // Atualizar o status específico com base no tipo de lista
        if (movieListsMap[movieId]) {
          movieListsMap[movieId][listType] = true;
        }
      });
      
      // Adicionar status das listas diretamente aos objetos de filmes
      movies = movies.map(movie => {
        const movieId = movie._id.toString();
        const listStatus = movieListsMap[movieId] || {
          favorite: false,
          watched: false,
          watchlist: false
        };
        
        // Adicionar status diretamente no objeto do filme
        return {
          ...movie,
          userLists: listStatus
        };
      });
    } else {
      // Para usuários não autenticados, adicionar valores padrão
      movies = movies.map(movie => ({
        ...movie,
        userLists: {
          favorite: false,
          watched: false,
          watchlist: false
        }
      }));
    }

    res.json({
      movies,
      currentPage: page,
      totalPages,
      total
    });
  } catch (error) {
    console.error('Error fetching movies with user status:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar filmes', 
      error: process.env.NODE_ENV === 'production' ? '🥞' : error.stack 
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