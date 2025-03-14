// authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, logout, getAllUsers, me } = require('../controllers/authController'); // Import the logout function

// User Registration
router.post('/register', register);

// User Login
router.post('/login', login);

// User Logout (clear client-side JWT)
router.post('/logout', logout);

// Get all users
router.get("/users", getAllUsers);

// Get current user
router.get("/me", me); 

module.exports = router;
