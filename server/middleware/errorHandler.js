export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Log server error securely without dumping sensitive request payloads
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error Caught] [${req.method} ${req.originalUrl}]:`, {
      name: err.name,
      message: err.message,
      statusCode,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 404;
    message = `Resource not found with id of '${err.value}'`;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value entered for '${field}'. Please provide another value.`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors || {}).map((val) => val.message).join(', ');
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    message = `Upload error: ${err.message}`;
  }

  // Production safety: hide unhandled 500 messages
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'An unexpected server error occurred. Our team has been notified.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};
