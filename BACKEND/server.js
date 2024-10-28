const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs'); // To handle file system operations
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const fsPromises = fs.promises; // Using fs promises for async operations

// Initialize the app
const app = express();
const port = process.env.PORT || 3000;

// Configure CORS
app.use(cors({
  origin: 'https://r2f.vercel.app/', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'x-auth-token'],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// MongoDB connection with increased pool size
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  poolSize: 10 ,// Increased pool size for concurrent requests
  socketTimeoutMS: 45000, // Adjust as needed
  connectTimeoutMS: 30000 // Adjust as needed
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define comment schema
const commentSchema = new mongoose.Schema({
  user: String,
  comment: String,
});
const Comment = mongoose.model('Comment', commentSchema);

// Define image schema
const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  statement: { type: String, required: true }
});
const Image = mongoose.model('Image', imageSchema);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Upload image with statement
app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

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

// Updated routes for images with pagination and limit
app.get('/images', async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Default page is 1 if not provided
  const limit = parseInt(req.query.limit) || 10; // Default limit is 10 items per page

  try {
    const images = await Image.find()
      .skip((page - 1) * limit) // Calculate the starting index
      .limit(limit); // Limit the results to the specified number
    res.status(200).json(images);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching images', error });
  }
});

// Updated routes for comments with pagination and limit
app.get('/comments', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const comments = await Comment.find()
      .skip((page - 1) * limit)
      .limit(limit);
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error });
  }
});

// Delete image with async fs handling
app.delete('/images/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const image = await Image.findById(id);
    if (!image) return res.status(404).json({ message: 'Image not found' });

    try {
      await fsPromises.access(image.url);
      await fsPromises.unlink(path.resolve(image.url));
      await Image.deleteOne({ _id: id });
      res.status(200).json({ message: 'Image deleted successfully' });
    } catch (fileError) {
      res.status(500).json({ message: 'Error deleting file', error: fileError });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting image', error });
  }
});

// Delete a comment
app.delete('/comments/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    await Comment.deleteOne({ _id: id });
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment', error });
  }
});

// Serve the display page
app.get('/display', (req, res) => {
  res.sendFile(path.join(__dirname, 'display.html'));
});

// Serve the upload page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
