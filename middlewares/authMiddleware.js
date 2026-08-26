const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// ─── Helper: Create a structured error ───────────────────────────────────────
const createError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

// ─── protect ─────────────────────────────────────────────────────────────────
// Validates the Bearer token in the Authorization header.
// On success, attaches the full user document to req.user (password excluded).
// On failure, passes a structured error to the global error handler.
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(createError('Not authorised — no token provided', 401));
    }

    const token = authHeader.split(' ')[1];

    // Verify & decode — throws if expired or tampered
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user from DB so a deleted/deactivated account is caught
    // Password is excluded via the schema's `select: false`
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(createError('The user belonging to this token no longer exists', 401));
    }

    if (!user.isActive) {
      return next(createError('Your account has been deactivated — contact support', 403));
    }

    req.user = user; // available to all downstream middleware & controllers
    next();
  } catch (err) {
    // JsonWebTokenError  → malformed token
    // TokenExpiredError  → valid token but past expiry
    if (err.name === 'JsonWebTokenError') {
      return next(createError('Invalid token — please log in again', 401));
    }
    if (err.name === 'TokenExpiredError') {
      return next(createError('Your session has expired — please log in again', 401));
    }
    next(err); // unexpected errors bubble up to the global handler
  }
};

// ─── adminOnly ────────────────────────────────────────────────────────────────
// Must be used AFTER `protect` — it assumes req.user is already populated.
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  next(createError('Access denied — admin privileges required', 403));
};

module.exports = { protect, adminOnly };
