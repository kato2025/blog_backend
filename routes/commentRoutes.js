const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const  authenticateToken = require("../middleware/authenticate"); // ✅ Correct Import

// Debugging
console.log("Comment Controller:", commentController);
console.log("Authenticate Module:", require("../middleware/authenticate")); // Should log: { authenticateToken: [Function] }
console.log("Authenticate Token:", authenticateToken); // Should log: [Function: authenticateToken]

// Protected routes
router.post('/', authenticateToken, commentController.createComment);
router.put('/:id', authenticateToken, commentController.updateComment);
router.delete('/:id', authenticateToken, commentController.deleteComment);

// Public routes
router.get('/', commentController.getAllComments);
router.get('/:id', commentController.getCommentById);

module.exports = router;
