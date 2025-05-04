const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

// Get comments for a specific movie
router.get('/movie/:movieId', commentController.getMovieComments);

// Add a new comment
router.post('/', commentController.addComment);

// Update a comment
router.put('/:id', commentController.updateComment);

// Delete a comment
router.delete('/:id', commentController.deleteComment);

module.exports = router;