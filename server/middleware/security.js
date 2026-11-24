import rateLimit from 'express-rate-limit';

// Sanitize inputs to prevent NoSQL query injection
const cleanNoSql = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(cleanNoSql);
  }

  const cleaned = {};
  for (const key of Object.keys(obj)) {
    // Strip leading $ or dots which are Mongo operator vectors
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    cleaned[key] = cleanNoSql(obj[key]);
  }
  return cleaned;
};

export const sanitizeInput = (req, res, next) => {
  if (req.body) req.body = cleanNoSql(req.body);
  if (req.query) req.query = cleanNoSql(req.query);
  if (req.params) req.params = cleanNoSql(req.params);
  next();
};

// Rate limiter for authentication routes (prevent brute force)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 auth requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
});

// Rate limiter for order placement and payment endpoints
export const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many order transactions initiated. Please wait a few minutes before trying again.',
  },
});

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
});
