// commentController.js:
const prisma = require('../prisma');

// Get all comments
// Get all comments
const getAllComments = async (req, res) => {
  try {
    const { postId } = req.query; // Get postId from query parameters

    // Fetch comments with createdAt, username, and email
    const comments = await prisma.comment.findMany({
      where: {
        ...(postId && { postId: Number(postId) }), // Filter by postId if provided
      },
      select: {
        id: true,
        content: true,
        postId: true,
        createdAt: true, // Ensure createdAt is fetched
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
    });

    // Format the response to match frontend expectations
    const formattedComments = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      postId: comment.postId,
      created_at: comment.createdAt, // Ensure the frontend gets this field
      username: comment.user?.username || 'Anonymous',
      email: comment.user?.email || 'No Email',
    }));

    res.json(formattedComments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

// Get a comment by ID
const getCommentById = async (req, res) => {
  const { id } = req.params;
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res.json(comment);
  } catch (error) {
    console.error('Error fetching comment:', error);
    res.status(500).json({ error: 'Failed to fetch comment' });
  }
};

// Create a new comment
const createComment = async (req, res) => {
  const { content, postId } = req.body;
  // Extract user id from req.user (set by authentication middleware)
  const userId = req.user ? (req.user.userId || req.user.id) : null;

  // Validate required fields
  if (!content || !postId || !userId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create the comment and link the user to the comment
    const comment = await prisma.comment.create({
      data: {
        content,
        postId: parseInt(postId),  // Ensure postId is an integer
        userId: userId,            // Use the authenticated user’s id
        username: user.username,   // Set username from the User model
        email: user.email,         // Set email from the User model
      },
      include: {
        user: true, // Include user details in the response
      },
    });

    // Return the created comment with user details
    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({
      error: 'Failed to create comment',
      details: error.message, // More detailed error message
    });
  }
};

// Update a comment
const updateComment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  try {
    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(id) },
      data: { content },
    });
    res.json(updatedComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
};

// Delete a comment
const deleteComment = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.comment.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send(); // No content returned after deletion
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

module.exports = {
  getAllComments,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
};
