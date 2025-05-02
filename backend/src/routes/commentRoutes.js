const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const mongoose = require('mongoose');

// Get comments for a specific movie
router.get('/movie/:movieId', async (req, res) => {
  try {
    // Validar se o ID do filme é um ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(req.params.movieId)) {
      return res.status(400).json({ message: 'ID de filme inválido' });
    }
    
    const comments = await Comment.find({ movie_id: req.params.movieId })
      .sort({ date: -1 }); // Ordenar pelos comentários mais recentes primeiro
      
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new comment
router.post('/', async (req, res) => {
  const { name, email, movie_id, text } = req.body;
  
  // Validações básicas
  if (!movie_id || !text) {
    return res.status(400).json({ message: 'ID do filme e texto são obrigatórios' });
  }
  
  // Validar se o ID do filme é um ObjectId válido
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
    res.status(400).json({ message: err.message });
  }
});

// Delete a comment (útil para moderação)
router.delete('/:id', async (req, res) => {
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
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;