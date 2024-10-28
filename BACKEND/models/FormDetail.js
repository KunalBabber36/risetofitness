const mongoose = require('mongoose');



const imageSchema = new mongoose.Schema({
    url: String,
    statement: String,
  });
  
  module.exports = mongoose.model('Image', imageSchema);


  const commentSchema = new mongoose.Schema({
    user: String,
    comment: String,
  });
  
  module.exports = mongoose.model('Comment', commentSchema);

const formDetailSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phoneno: { type: String, required: true },
    message: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FormDetail', formDetailSchema);
