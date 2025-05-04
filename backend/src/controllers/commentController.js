const Comment = require('../models/Comment');
const mongoose = require('mongoose');

exports.getMovieComments = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.movieId)) {
      return res.status(400).json({ message: 'ID de filme inválido' });
    }
    
    const comments = await Comment.find({ movie_id: req.params.movieId })
      .sort({ date: -1 });
      
    res.json(comments);
  } catch (err) {
    res.status(500).json({ 
      message: 'Erro ao procurar comentários',
      error: err.message 
    });
  }
};

exports.addComment = async (req, res) => {
  const { name, email, movie_id, text } = req.body;
  
  if (!movie_id || !text) {
    return res.status(400).json({ message: 'ID do filme e texto são obrigatórios' });
  }
  
  if (!mongoose.Types.ObjectId.isValid(movie_id)) {
    return res.status(400).json({ message: 'ID de filme inválido' });
  }

  const comment = new Comment({
    name,
    email,
    movie_id,
    text,
    date: new Date()
  });

  try {
    const newComment = await comment.save();
    res.status(201).json(newComment);
  } catch (err) {
    res.status(400).json({ 
      message: 'Erro ao adicionar comentário',
      error: err.message 
    });
  }
};

exports.updateComment = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID de comentário inválido' });
    }
    
    const { text, rating } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'O texto do comentário é obrigatório' });
    }
    
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comentário não encontrado' });
    }
    
    // Atualizar os campos do comentário
    comment.text = text;
    if (rating !== undefined) {
      comment.rating = rating;
    }
    
    const updatedComment = await comment.save();
    res.json(updatedComment);
  } catch (err) {
    res.status(500).json({ 
      message: 'Erro ao atualizar comentário',
      error: err.message 
    });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID de comentário inválido' });
    }
    
    const comment = await Comment.findByIdAndDelete(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comentário não encontrado' });
    }
    
    res.json({ message: 'Comentário removido com sucesso' });
  } catch (err) {
    res.status(500).json({ 
      message: 'Erro ao remover comentário',
      error: err.message 
    });
  }
};