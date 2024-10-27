const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

// Initialize the app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, '..', 'FRONTEND'))); // Serve static files from FRONTEND
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// Admin credentials (replace this with a secure database store in production)
const adminUsername = 'admin';
const adminPasswordHash = '$2a$10$B4ZnovNNk6BBMPHjfyrw4uKb/H4HFY2HGBx/R1NLUuVFx9qo16yMK'; // Hash of 'mypassword'

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/combinedDB', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Schemas and Models
const commentSchema = new mongoose.Schema({
    user: String,
    comment: String,
});
const imageSchema = new mongoose.Schema({
    url: { type: String, required: true },
    statement: { type: String, required: true }
});
const Comment = mongoose.model('Comment', commentSchema);
const Image = mongoose.model('Image', imageSchema);

// Multer Configuration for File Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Login Route
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username !== adminUsername) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    bcrypt.compare(password, adminPasswordHash, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Server error' });
        }
        if (result) {
            return res.status(200).json({ message: 'Access granted!' });
        } else {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
    });
});

// Routes for Images
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

app.get('/uploads', async (req, res) => {
    try {
        const images = await Image.find();
        res.status(200).json(images);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching images', error });
    }
});

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

// Routes for Comments
app.get('/comments', async (req, res) => {
  try {
    const comments = await CommentModel.find(); // Assuming Mongoose or similar
    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Internal Server Error" });
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

// Serve HTML Pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'FRONTEND', 'index.html'));
});

app.get('/display', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'FRONTEND', 'display.html'));
});

// Start the Server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
