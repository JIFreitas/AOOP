const UserMovieList = require('../models/UserMovieList');
const mongoose = require('mongoose');

/**
 * Adicionar um filme à lista de um usuário
 */
exports.addMovieToList = async (req, res) => {
  try {
    const { movie_id, list_type } = req.body;
    const user_id = req.userId; // Vem do middleware de autenticação

    if (!mongoose.Types.ObjectId.isValid(movie_id)) {
      return res.status(400).json({ 
        success: false,
        message: 'ID de filme inválido' 
      });
    }

    // Verificar se o tipo de lista é válido
    if (!['favorite', 'watched', 'watchlist'].includes(list_type)) {
      return res.status(400).json({ 
        success: false,
        message: 'Tipo de lista inválido. Use favorite, watched ou watchlist.' 
      });
    }

    // Se for watched ou watchlist, remover o registro contrário
    if (list_type === 'watched' || list_type === 'watchlist') {
      const oppositeType = list_type === 'watched' ? 'watchlist' : 'watched';
      await UserMovieList.findOneAndDelete({
        user_id,
        movie_id,
        list_type: oppositeType
      });
    }

    // Upsert: inserir se não existir ou atualizar se já existir
    let userMovieList = await UserMovieList.findOneAndUpdate(
      { user_id, movie_id, list_type },
      { date_added: new Date() },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      message: 'Filme adicionado à lista com sucesso',
      data: userMovieList
    });
  } catch (err) {
    if (err.code === 11000) { // Erro de duplicidade
      return res.status(409).json({
        success: false,
        message: 'Este filme já está na sua lista'
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Erro ao adicionar filme à lista',
      error: err.message 
    });
  }
};

/**
 * Remover um filme da lista de um usuário
 */
exports.removeMovieFromList = async (req, res) => {
  try {
    const { movie_id, list_type } = req.params;
    const user_id = req.userId; // Vem do middleware de autenticação

    if (!mongoose.Types.ObjectId.isValid(movie_id)) {
      return res.status(400).json({ 
        success: false,
        message: 'ID de filme inválido' 
      });
    }

    const result = await UserMovieList.findOneAndDelete({
      user_id,
      movie_id,
      list_type
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Filme não encontrado na sua lista'
      });
    }

    res.json({
      success: true,
      message: 'Filme removido da lista com sucesso'
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Erro ao remover filme da lista',
      error: err.message 
    });
  }
};

/**
 * Verificar se um filme está em alguma lista do usuário
 */
exports.checkMovieInLists = async (req, res) => {
  try {
    const { movie_id } = req.params;
    const user_id = req.userId; // Vem do middleware de autenticação

    if (!mongoose.Types.ObjectId.isValid(movie_id)) {
      return res.status(400).json({ 
        success: false,
        message: 'ID de filme inválido' 
      });
    }

    const lists = await UserMovieList.find({
      user_id,
      movie_id
    });

    // Criar um objeto com booleanos para cada tipo de lista
    const result = {
      favorite: false,
      watched: false,
      watchlist: false
    };

    // Marcar quais listas contêm o filme
    lists.forEach(item => {
      result[item.list_type] = true;
    });

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Erro ao verificar listas',
      error: err.message 
    });
  }
};

/**
 * Obter todos os filmes de uma determinada lista do usuário
 */
exports.getMoviesFromList = async (req, res) => {
  try {
    const { list_type } = req.params;
    const user_id = req.userId; // Vem do middleware de autenticação

    // Verificar se o tipo de lista é válido
    if (!['favorite', 'watched', 'watchlist'].includes(list_type)) {
      return res.status(400).json({ 
        success: false,
        message: 'Tipo de lista inválido. Use favorite, watched ou watchlist.' 
      });
    }

    // Usar agregação para obter também os detalhes dos filmes
    const movies = await UserMovieList.aggregate([
      {
        $match: { user_id: new mongoose.Types.ObjectId(user_id), list_type }
      },
      {
        $lookup: {
          from: 'movies',
          localField: 'movie_id',
          foreignField: '_id',
          as: 'movie'
        }
      },
      {
        $unwind: '$movie'
      },
      {
        $sort: { date_added: -1 }
      },
      {
        $project: {
          _id: 0,
          movie: 1,
          date_added: 1
        }
      }
    ]);

    res.json({
      success: true,
      list_type,
      count: movies.length,
      data: movies
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Erro ao obter filmes da lista',
      error: err.message 
    });
  }
};