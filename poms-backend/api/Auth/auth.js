const express = require('express');
const jwt = require('jsonwebtoken');
const userDB = require('./userDB');
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change_me_for_local_development';

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await userDB.authenticateUser(username, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.userId, role: user.role, display_name: user.display_name },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, role: user.role, display_name: user.display_name });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware to verify JWT
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { router, authenticateJWT, isAdmin };
