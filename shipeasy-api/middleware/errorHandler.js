const logger = require('../utils/logger');

class AppError extends Error {
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.timestamp = new Date().toISOString();
        Error.captureStackTrace(this, this.constructor);
    }
}

const notFoundHandler = (req, res, next) => {
    const error = new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404);
    next(error);
};

// eslint-disable-next-line no-unused-vars
const globalErrorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const isOperational = err.isOperational || false;

    logger.error(err.message, {
        traceId: req.traceId,
        statusCode,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userId: req.userId,
        stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    });

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            details: err.message,
        });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({
            error: 'Invalid ID format',
        });
    }

    if (err.code === 11000) {
        return res.status(409).json({
            error: 'Duplicate entry',
            field: Object.keys(err.keyValue || {}),
        });
    }

    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
    }

    const response = {
        error: isOperational ? err.message : 'Internal server error',
    };

    if (process.env.NODE_ENV !== 'production' && !isOperational) {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

module.exports = {
    AppError,
    notFoundHandler,
    globalErrorHandler,
};
