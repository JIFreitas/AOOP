const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const userMovieListController = require('../controllers/userMovieListController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');

// Rotas públicas que podem usar autenticação opcional
// Get movies with user list status (for optimized frontend performance)
router.get('/with-status', optionalAuth, movieController.getMoviesWithUserStatus);

// Get all movies with pagination and optional search
router.get('/', optionalAuth, movieController.getAllMovies);

// Get a list of all movie genres
router.get('/genres', movieController.getGenres);

// Get a single movie by ID
router.get('/:id', movieController.getMovieById);

// Rotas protegidas (requerem autenticação)
// Adicionar um filme a uma lista do usuário (favoritos, assistidos, quero assistir)
router.post('/list', authenticate, userMovieListController.addMovieToList);

// Remover um filme de uma lista do usuário
router.delete('/list/:movie_id/:list_type', authenticate, userMovieListController.removeMovieFromList);

// Verificar em quais listas do usuário um filme está
router.get('/check-lists/:movie_id', authenticate, userMovieListController.checkMovieInLists);

// Obter todos os filmes de uma lista específica do usuário
router.get('/list/:list_type', authenticate, userMovieListController.getMoviesFromList);

module.exports = router;