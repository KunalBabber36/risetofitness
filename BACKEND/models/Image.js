// models/Image.js
const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: String,
  statement: String,
});

module.exports = mongoose.model('Image', imageSchema);