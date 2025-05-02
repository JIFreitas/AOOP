const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  name: String,
  email: String,
  movie_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Comment = mongoose.model('Comment', commentSchema, 'comments');

module.exports = Comment;