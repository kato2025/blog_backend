// Description: Handles all routes related to posts
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController'); // Ensure correct import
const authenticateToken = require("../middleware/authenticate"); // Import authentication middleware

// Public routes
router.get('/', postController.getAllPosts); // Get all posts
router.get('/:id', postController.getPostById); // Get a post by ID

// Protected routes (require authentication)
router.post('/', authenticateToken, postController.createPost); // Create a new post
router.put('/:id', authenticateToken, postController.updatePost); // Update a post
router.delete('/:id', authenticateToken, postController.deletePost); // Delete a post

module.exports = router;
