const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Use environment variable for MongoDB URI
const port = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'your-mongodb-uri-here';

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, '../FRONTEND'))); // Serve frontend files

// MongoDB connection
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Mongoose schemas and models
const commentSchema = new mongoose.Schema({
  user: String,
  comment: String,
});
const Comment = mongoose.model('Comment', commentSchema);

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  statement: { type: String, required: true }
});
const Image = mongoose.model('Image', imageSchema);

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../FRONTEND/index.html'));
});

// Upload image with statement
app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const image = new Image({
    url: req.file.path,
    statement: req.body.statement
  });

  try {
    await image.save();
    res.status(200).json({ message: 'Image uploaded successfully', file: req.file });
  } catch (error) {
    res.status(500).json({ message: 'Error saving image to database', error });
  }
});

// Fetch images
app.get('/images', async (req, res) => {
  try {
    const images = await Image.find();
    res.status(200).json(images);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching images', error });
  }
});

// Delete image
app.delete('/images/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const image = await Image.findById(id);
    if (!image) return res.status(404).json({ message: 'Image not found' });

    fs.access(image.url, fs.constants.F_OK, (err) => {
      if (err) return res.status(404).json({ message: 'File not found' });

      fs.unlink(path.resolve(image.url), async (err) => {
        if (err) return res.status(500).json({ message: 'Error deleting file', error: err });

        await Image.deleteOne({ _id: id });
        res.status(200).json({ message: 'Image deleted successfully' });
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting image', error });
  }
});

// Delete comment
app.delete('/comments/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    await Comment.deleteOne({ _id: id });
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment', error });
  }
});

// Serve comments and add comment
app.get('/comments', async (req, res) => {
  try {
    const comments = await Comment.find();
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error });
  }
});

app.post('/comments', async (req, res) => {
  const { user, comment } = req.body;
  const newComment = new Comment({ user, comment });
  try {
    await newComment.save();
    res.status(201).json({ message: 'Comment added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving comment', error });
  }
});

// Ensure Vercel handles server startup; no app.listen() required

module.exports = app;
