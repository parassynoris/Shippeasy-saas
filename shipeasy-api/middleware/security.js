const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

/**
 * Security headers via helmet
 */
const securityHeaders = helmet({
    contentSecurityPolicy: false, // CSP is managed by nginx for the frontend
    crossOriginEmbedderPolicy: false, // Allow embedding for Swagger UI
});

/**
 * General API rate limiter
 * Configurable via RATE_LIMIT_MAX env var (default: 100 per 15 minutes per IP)
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests, please try again later.',
        },
    },
    skip: (req) => {
        // Skip rate limiting for health checks
        return req.path === '/health' || req.path === '/version';
    },
});

/**
 * Strict rate limiter for authentication endpoints
 * Configurable via AUTH_RATE_LIMIT_MAX env var (default: 10 per 15 minutes per IP)
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: {
            code: 'AUTH_RATE_LIMIT_EXCEEDED',
            message: 'Too many authentication attempts, please try again later.',
        },
    },
});

/**
 * NoSQL injection prevention middleware
 * Strips MongoDB operators ($-prefixed keys) from request bodies
 * to prevent query injection via generic CRUD endpoints.
 */
function sanitizeInput(req, res, next) {
    if (req.body) {
        req.body = deepSanitize(req.body);
    }
    if (req.query) {
        req.query = deepSanitize(req.query);
    }
    if (req.params) {
        req.params = deepSanitize(req.params);
    }
    next();
}

/**
 * Recursively remove keys starting with $ from objects
 * to prevent MongoDB operator injection.
 */
function deepSanitize(obj) {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
        return obj.map(item => deepSanitize(item));
    }

    const sanitized = {};
    for (const key of Object.keys(obj)) {
        // Block MongoDB operators: keys starting with $
        if (key.startsWith('$')) {
            continue;
        }
        sanitized[key] = deepSanitize(obj[key]);
    }
    return sanitized;
}

module.exports = {
    securityHeaders,
    apiLimiter,
    authLimiter,
    sanitizeInput,
    deepSanitize,
};
