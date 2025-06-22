const mongoose = require('mongoose');

const userMovieListSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movie_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  list_type: {
    type: String,
    enum: ['favorite', 'watched', 'watchlist'],
    required: true
  },
  date_added: {
    type: Date,
    default: Date.now
  }
});

userMovieListSchema.index({ user_id: 1, movie_id: 1, list_type: 1 }, { unique: true });

const UserMovieList = mongoose.model('UserMovieList', userMovieListSchema, 'user_movie_lists');

module.exports = UserMovieList;