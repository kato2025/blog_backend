const express = require('express'); // Import Express
const cors = require('cors'); // Import CORS
const jwt = require('jsonwebtoken'); // Import JWT
const { PrismaClient } = require('@prisma/client');  // Import Prisma Client
const authRoutes = require('./routes/authRoutes'); // Import the authRoutes
const postRoutes = require('./routes/postRoutes'); // Import the postRoutes
const commentRoutes = require('./routes/commentRoutes'); // Import the commentRoutes
const authController = require('./controllers/authController'); // Import the authController
const commentController = require('./controllers/commentController');  // Import the commentController
const postController = require('./controllers/postController');  // Make sure this path is correct
const dotenv = require('dotenv'); // Import dotenv
const authenticateToken = require('./middleware/authenticate'); // Assuming the correct path

dotenv.config();  // Initialize dotenv
const prisma = new PrismaClient();  // Instantiate Prisma Client
const app = express(); // Create an Express app
const PORT = process.env.PORT || 3000; // Set the port to the environment variable or 3000

// Middleware to parse JSON bodies
app.use(express.json()); // Parse JSON bodies

// Enable CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001'], // Allow frontend
  credentials: true, // Allow cookies and authentication headers
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow these methods
}));

// Unified error handler middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err); // Log the error
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' }); // Respond with an error message
});

// Get all users
app.get('/users', authenticateToken, authController.getAllUsers); // Protect the route and use the function from authController

// Get current authenticated user
app.get('/auth/me', authenticateToken, authController.me);

// Get all published posts
app.get('/posts', authenticateToken, postController.getAllPosts); // Use the getAllPosts function from the controller

// Get a single post by ID
app.get('/posts/:id', authenticateToken, postController.getPostById); // Use the getPostById function from the controller

// Create a new post
app.post('/posts', authenticateToken, postController.createPost); // Use the createPost function from the controller

// Update a post
app.put('/posts/:id', authenticateToken, postController.updatePost); // Use the updatePost function from the controller

// Delete a post (use postController's deletePost function)
app.delete('/posts/:id', authenticateToken, postController.deletePost); // Use the deletePost function from the controller

// Create a Comment
app.post('/comments', authenticateToken, commentController.createComment);  // Use the createComment function from the controller

// Get a comment by ID
app.get('/comments/:id', authenticateToken, commentController.getCommentById); // Use the getCommentById function from the controller

// Get all comments (use commentController's getAllComments function)
app.get('/comments', authenticateToken, commentController.getAllComments); // Use the getAllComments function from the controller

// Update a comment
app.put('/comments/:id', authenticateToken, commentController.updateComment); // Use the updateComment function from the controller

// Delete a comment
app.delete('/comments/:id', authenticateToken, commentController.deleteComment); // Use the deleteComment function from the controller

// Register a new user
app.post('/register', authController.register); // Use the register function from the authController

// Login a user
app.post('/login', authController.login); // Use the login function from the authController

// Logout a user
app.post('/logout', authenticateToken, authController.logout); // Use the logout function from the authController

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`); // Log the server URL
});

// Graceful shutdown for Prisma
process.on('SIGINT', async () => {
  await prisma.$disconnect(); // Disconnect Prisma Client
  console.log('Prisma Client disconnected. Server shutting down.'); // Log the shutdown
  process.exit(0); // Exit the process
});