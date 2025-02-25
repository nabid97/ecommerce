<<<<<<< HEAD
// File: src/server/routes/authRoutes.js
// Make sure this file exists and has the correct format:

=======
>>>>>>> 0debe13269b25c54fb4fa8cde1294e72ff73f8eb
const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

<<<<<<< HEAD
// POST /register
router.post('/register', registerUser);

// POST /login
router.post('/login', loginUser);

// GET /me
router.get('/me', (req, res) => {
  // This is a temporary implementation
  res.json({ id: '1', email: 'user@example.com' });
});

// POST /logout
router.post('/logout', (req, res) => {
  // This is a temporary implementation
  res.json({ message: 'Logged out successfully' });
});

=======
// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/login
router.post('/login', loginUser);

>>>>>>> 0debe13269b25c54fb4fa8cde1294e72ff73f8eb
module.exports = router;