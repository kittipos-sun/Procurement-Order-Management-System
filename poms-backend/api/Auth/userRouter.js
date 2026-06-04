const express = require('express');
const router = express.Router();
const { authenticateJWT, isAdmin } = require('./auth');
const userDB = require('./userDB');

// Get all users (Admin only)
router.get('/', authenticateJWT, isAdmin, (req, res) => {
  try {
    const users = userDB.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/me', authenticateJWT, (req, res) => {
  try {
    const user = userDB.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific user (Admin only)
router.get('/:userId', authenticateJWT, isAdmin, (req, res) => {
  try {
    const user = userDB.getUserById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new user (Admin only)
router.post('/', authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { username, password, display_name, role } = req.body;
    
    if (!username || !password || !display_name || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const validRoles = ['Purchasing', 'Accounting', 'Administrative', 'Admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const newUser = await userDB.createUser({
      username,
      password,
      display_name,
      role
    });

    res.status(201).json(newUser);
  } catch (err) {
    if (err.message === 'Username already exists') {
      return res.status(409).json({ error: err.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user (Admin can update any, others can only update themselves)
router.put('/:userId', authenticateJWT, async (req, res) => {
  try {
    const { userId } = req.params;
    const { password, display_name, role } = req.body;
    
    // Non-admin users can only update themselves
    if (req.user.role !== 'Admin' && req.user.userId !== userId) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

    // Only admin can change roles
    if (role && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Only admin can change roles' });
    }

    const updateData = {};
    if (password) updateData.password = password;
    if (display_name) updateData.display_name = display_name;
    if (role) updateData.role = role;

    const updatedUser = await userDB.updateUser(userId, updateData);
    res.json(updatedUser);
  } catch (err) {
    if (err.message === 'User not found') {
      return res.status(404).json({ error: err.message });
    } else if (err.message === 'Username cannot be changed') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user (Admin only)
router.delete('/:userId', authenticateJWT, isAdmin, (req, res) => {
  try {
    const deletedUser = userDB.deleteUser(req.params.userId);
    res.json(deletedUser);
  } catch (err) {
    if (err.message === 'User not found') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;