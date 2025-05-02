const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  year: Number,
  runtime: Number,
  plot: String,
  poster: String,
  genres: [String],
  directors: [String],
  cast: [String],
  rated: String,
  imdb: {
    rating: Number,
    votes: Number,
    id: Number
  }
});

const Movie = mongoose.model('Movie', movieSchema, 'movies');

module.exports = Movie;