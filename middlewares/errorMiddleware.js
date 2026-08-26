// ─── 404 Handler ──────────────────────────────────────────────────────────────
// Catches requests that fall through all defined routes.
const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Express identifies this as an error handler via the 4-argument signature.
// All errors thrown or passed via next(err) land here.
// eslint-disable-next-line no-unused-vars
const globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message    = err.message || 'Internal Server Error';

  // ── Mongoose: CastError (e.g. invalid ObjectId format) ───────────────────
  if (err.name === 'CastError') {
    statusCode = 400;
    message    = `Invalid ${err.path}: "${err.value}"`;
  }

  // ── Mongoose: Duplicate key (e.g. duplicate email or SKU) ────────────────
  if (err.code === 11000) {
    statusCode = 409; // Conflict
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for field "${field}" — this ${field} is already in use`;
  }

  // ── Mongoose: Validation error (e.g. required field missing) ─────────────
  if (err.name === 'ValidationError') {
    statusCode = 400;
    // Collect all failing field messages into one readable string
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join('. ');
  }

  // ── JWT errors (failsafe — should be caught in authMiddleware first) ──────
  if (err.name === 'JsonWebTokenError')  { statusCode = 401; message = 'Invalid token'; }
  if (err.name === 'TokenExpiredError') { statusCode = 401; message = 'Token expired'; }

  // Log the full error in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[${new Date().toISOString()}] ${statusCode} — ${message}`);
    if (statusCode === 500) console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Only expose the stack trace in development
    ...(process.env.NODE_ENV !== 'production' && statusCode === 500 && { stack: err.stack }),
  });
};

module.exports = { notFound, globalErrorHandler };
