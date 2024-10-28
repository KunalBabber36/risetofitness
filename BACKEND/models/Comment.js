// models/Comment.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: String,
  comment: String,
});

module.exports = mongoose.model('Comment', commentSchema);
