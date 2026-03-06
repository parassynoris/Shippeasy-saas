const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const helmetMiddleware = helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
});

const corsConfig = () => {
    const allowedOrigins = (process.env.CORS_ORIGINS || '')
        .split(',')
        .map(o => o.trim())
        .filter(Boolean);

    return {
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('CORS: origin not allowed'));
            }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type', 'Authorization', 'x-api-key',
            'frontend-trace-id', 'X-Requested-With'
        ],
        exposedHeaders: ['X-Trace-Id'],
        credentials: true,
        maxAge: 86400,
    };
};

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
    validate: { xForwardedForHeader: false },
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many authentication attempts, please try again later.' },
    validate: { xForwardedForHeader: false },
});

const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many upload requests, please try again later.' },
});

const sanitizeInput = mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        const logger = require('../utils/logger');
        logger.warn(`Sanitized key "${key}" in request from ${req.ip}`, {
            traceId: req.traceId,
            path: req.path,
        });
    },
});

const preventParamPollution = hpp({
    whitelist: ['sort', 'fields', 'page', 'limit'],
});

module.exports = {
    helmetMiddleware,
    corsConfig,
    globalLimiter,
    authLimiter,
    uploadLimiter,
    sanitizeInput,
    preventParamPollution,
};
