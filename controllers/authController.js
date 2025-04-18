const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

// Get logged-in user's info
const me = async (req, res) => {
  console.log("Decoded token in /auth/me:", req.user);
  // Try to get the user id from the token payload
  const userId = req.user.userId || req.user.id; // accommodate both possibilities
  
  if (!userId) {
    return res.status(400).json({ error: "Token payload invalid: missing user id" });
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user", details: error.message });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();  // Fetch all users from the database
    res.json(users);  // Respond with the user data in JSON format
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  }
};

// Register a new user
const register = async (req, res) => {
  try {
    console.log("Received request:", req.body);

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Ensure password is at least 6 characters
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    console.log("Checking if user exists...");
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);
    if (!hashedPassword) {
      return res.status(500).json({ error: "Password hashing failed" });
    }

    console.log("Creating new user...");
    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword },
    });

    console.log("User registered successfully:", user);

    return res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Registration Error:", error);

    // Return only the actual error message
    return res.status(500).json({ error: error.message });
  }
};

// Login a user
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(401).json({ error: 'Invalid credentials' });

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
};

// Logout a user
const logout = (req, res) => {
  // Since JWT is stateless, logout simply means removing the token on the client-side
  res.json({ message: 'Logged out successfully' });
};

module.exports = { register, login, logout, getAllUsers, me };
