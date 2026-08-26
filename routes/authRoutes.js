const express = require('express');
const router  = express.Router();

const { register, login, getProfile, updateProfile, addAddress } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// ─── Public routes ─────────────────────────────────────────────────────────────
router.post('/register', register);
router.post('/login',    login);

// ─── Protected routes (valid JWT required) ────────────────────────────────────
router.get ('/profile', protect, getProfile);
router.put ('/profile', protect, updateProfile);
router.post('/address', protect, addAddress);

module.exports = router;
