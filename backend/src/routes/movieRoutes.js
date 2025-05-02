const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

// Get all movies with pagination and optional search
router.get('/', movieController.getMovies);

// Get a list of all movie genres
router.get('/genres', movieController.getGenres);

// Get a single movie by ID
router.get('/:id', movieController.getMovieById);

module.exports = router;