// server.js
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bodyParser = require('body-parser');
const Image = require('./models/Image');
const Comment = require('./models/Comment');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public')); // For serving uploaded images
const upload = multer({ dest: 'public/uploads/' }); // Configure multer to store files

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/yourDatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Route to fetch all images
app.get('/images', async (req, res) => {
  try {
    const images = await Image.find();
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching images' });
  }
});

// Route to upload a new image
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const newImage = new Image({
      url: `/uploads/${req.file.filename}`, // Image URL path
      statement: req.body.statement,
    });
    await newImage.save();
    res.json({ message: 'Image uploaded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading image' });
  }
});

// Route to delete an image
app.delete('/images/:id', async (req, res) => {
  try {
    await Image.findByIdAndDelete(req.params.id);
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting image' });
  }
});

// Route to fetch all comments
app.get('/comments', async (req, res) => {
  try {
    const comments = await Comment.find();
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error loading comments' });
  }
});

// Route to add a new comment
app.post('/comments', async (req, res) => {
  try {
    const newComment = new Comment({
      user: req.body.user,
      comment: req.body.comment,
    });
    await newComment.save();
    res.json({ message: 'Comment added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment' });
  }
});

// Route to delete a comment
app.delete('/comments/:id', async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
