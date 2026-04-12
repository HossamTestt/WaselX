/**
 * Error Handling Middleware
 * Centralized error responses for the WaselX API
 */

/**
 * 404 Not Found handler — called when no route matches
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

/**
 * Global error handler
 * Formats all errors into a consistent JSON response
 */
const errorHandler = (err, req, res, next) => {
  // Default to 500 if no status code set
  const statusCode = err.status || err.statusCode || 500;

  // Log server errors in development
  if (statusCode >= 500 && process.env.NODE_ENV !== 'test') {
    console.error('[ERROR]', err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // Only include stack trace in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
