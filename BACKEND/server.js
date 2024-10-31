require('dotenv').config();
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const multer = require('multer');
const fs = require('fs'); // To handle file system operations
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const FormDetail = require('./models/FormDetail'); // Import model


// Initialize the app
const app = express();
// const port = 3000;
const port = process.env.PORT || 3000;
app.use(cors({
  origin: 'https://r2f.vercel.app/', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'x-auth-token'],
  credentials: true
}));


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: 'yourSecureSecretKey', // Use a secure, random string
    resave: false,
    saveUninitialized: true,
  })
);
app.use(express.static(path.join(__dirname, 'views'))); // Serve static files


// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.isAuthenticated) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Route to display login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Route to handle login form submission
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        req.session.isAuthenticated = true;
        res.redirect('/admin');
    } else {
        res.send('Invalid credentials. Please try again.');
    }
});

// Plan Schema
const planSchema = new mongoose.Schema({
  planType: String,
  selectedBy: String,
  date: { type: Date, default: Date.now }
});

const Plan = mongoose.model('Plan', planSchema);

// Route to select plan
app.post('/select-plan', (req, res) => {
  const { planType, userName } = req.body;

  const newPlan = new Plan({ planType, selectedBy: userName });
  newPlan.save()
      .then(() => res.json({ message: 'Plan selected successfully' }))
      .catch((error) => res.status(500).json({ error: 'Error saving plan' }));
});

// Route to retrieve selected plans for admin view
app.get('/admin/plans', (req, res) => {
  Plan.find()
      .then((plans) => res.json(plans))
      .catch((error) => res.status(500).json({ error: 'Error retrieving plans' }));
});

// Route to handle logout
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// Route to display form for submission
// app.get('/', (req, res) => {
//     res.send(`
//         <form action="/submit" method="POST">
//             <input type="text" name="name" placeholder="Name" required>
//             <input type="email" name="email" placeholder="Email" required>
//             <textarea name="message" placeholder="Message" required></textarea>
//             <button type="submit">Submit</button>
//         </form>
//     `);
// });

// Route to handle form submission and save to MongoDB
app.post('/submit', async (req, res) => {
    try {
        const { name, email, phoneno, message } = req.body;
        const newFormDetail = new FormDetail({ name, email,phoneno, message });
        await newFormDetail.save();
        res.send('Form submitted successfully.');
    } catch (err) {
        res.status(500).send('Error saving form data.');
    }
});

// Protected route for admin page
app.get('/admin', isAuthenticated, async (req, res) => {
    const formDetails = await FormDetail.find();
    res.send(`
        <h1>Admin Panel - Submitted Form Details</h1>
        ${formDetails.map(detail => `
            <div>
                <p><strong>Name:</strong>${detail.name}</p>
                <p><strong>Email:</strong> ${detail.email}</p>
                <p><strong>Phone No:</strong> ${detail.phoneno}</p>
                <p><strong>Message:</strong> ${detail.message}</p>
            </div>
            
        `).join('')}
        <a href="/logout">Logout</a>
    `);
});

// // Serve the admin page only to authenticated users
// app.get('/admin', isAuthenticated, (req, res) => {
//   res.sendFile(path.join(__dirname, 'views', 'admin.html'));
// });


// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'FRONTEND'))); // Serve static files
app.use('/uploads', express.static('uploads')); // Serve uploaded files
// Serve static files from the FRONTEND directory
app.use(express.static(path.join(__dirname, '..', 'FRONTEND'))); // Navigate up one level to BACKEND, then into FRONTEND

// Serve index.html on the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'FRONTEND', 'index.html')); // Same navigation as above
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
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
// Fetch images
app.get('/images', async (req, res) => {
  try {
    const images = await Image.find();
    res.status(200).json(images);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching images', error });
  }
});
app.get('/', (req, res) => {
  res.send('Hello from Vercel!');
});

// Set up your other middleware and routes
// Example route
app.get('/api/data', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});


// Delete image
app.delete('/images/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Find the image by ID
    const image = await Image.findById(id);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Check if the file exists
    fs.access(image.url, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(404).json({ message: 'File not found' });
      }

      // Delete the image file from the uploads folder
      fs.unlink(path.resolve(image.url), async (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error deleting file', error: err });
        }

        // After the file is deleted, remove the entry from MongoDB using deleteOne()
        await Image.deleteOne({ _id: id });
        res.status(200).json({ message: 'Image deleted successfully' });
      });
    });
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


// Routes for comments
// Get comments
app.get('/comments', async (req, res) => {
  try {
    const comments = await Comment.find();
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error });
  }
});

// Post a new comment
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

// Routes for images
// Upload image with statement
// app.post('/upload', upload.single('image'), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ message: 'No file uploaded' });
//   }

//   const image = new Image({
//     url: req.file.path,
//     statement: req.body.statement
//   });

//   try {
//     await image.save();
//     res.status(200).json({ message: 'Image uploaded successfully', file: req.file });
//   } catch (error) {
//     res.status(500).json({ message: 'Error saving image to database', error });
//   }
// });

// // Fetch images
// app.get('/images', async (req, res) => {
//   try {
//     const images = await Image.find();
//     res.status(200).json(images);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching images', error });
//   }
// });

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
