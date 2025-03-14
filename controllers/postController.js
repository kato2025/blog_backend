// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();
const prisma = require('../prisma');

// Get all published posts
const getAllPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: { comments: true },
    });
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

// Get a single post by ID
const getPostById = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id, 10) }, // Ensure it's being parsed as an integer
      include: { comments: true },
    });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error('Error fetching post by ID:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
};

// Create a new post
const createPost = async (req, res) => {
  try {
    const { title, content, published, authorId } = req.body;

    // Validate required fields
    if (!title || !content || typeof published === 'undefined' || !authorId) {
      return res.status(400).json({ error: "Missing required fields: title, content, published, and authorId are required." });
    }

    // Optionally, check if the author exists (if your database schema requires a valid author)
    const author = await prisma.user.findUnique({
      where: { id: Number(authorId) }
    });
    if (!author) {
      return res.status(404).json({ error: "Author not found." });
    }

    // Create the post
    const post = await prisma.post.create({
      data: {
        title,
        content,
        published,
        author: {
          connect: { id: Number(authorId) }
        }
      }
    });

    return res.status(201).json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({ error: "Failed to create post" });
  }
};

// Update post
const updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, content, published } = req.body;

  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized: No valid user detected" });
  }
  
  // Use either req.user.id or req.user.userId and convert to number.
  const userId = Number(req.user.id || req.user.userId);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized: No valid user id found" });
  }

  const postId = parseInt(id, 10);
  if (isNaN(postId)) {
    return res.status(400).json({ error: "Invalid post ID" });
  }

  try {
    console.log(`Updating post ID: ${postId} by user ID: ${userId}`);

    // Check if the post exists
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });
    console.log("Existing Post:", existingPost);

    if (!existingPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Ensure the logged-in user owns the post.
    if (existingPost.authorId !== userId) {
      return res.status(403).json({ error: "Forbidden: You cannot update someone else's post" });
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(published !== undefined && { published }),
      },
    });

    // Return the updated post object directly.
    res.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Post not found" });
    }
    res.status(500).json({ error: "Failed to update post", details: error.message });
  }
};

// Delete a post
const deletePost = async (req, res) => {
  const { id } = req.params;

  try {
    // First, check if the post exists
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) },
      include: { comments: true }, // Include comments to check if they exist
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // If there are related comments, send a warning to the front-end
    if (post.comments.length > 0) {
      return res.status(400).json({
        warning: 'You cannot delete this post because it has related comments',
        postId: id,
      });
    }

    // If no comments, delete the post
    await prisma.post.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send(); // No content returned after delete
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post', details: error.message });
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
};