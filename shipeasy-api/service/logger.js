const pino = require('pino');

// Structured async logging with pino
const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    // Pretty print in development
    transport: process.env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
    // Add timestamp and base metadata
    base: {
        service: 'shipeasy-api',
        env: process.env.ENVIRONMENT || 'development'
    }
});

// Create child loggers for different modules
const createLogger = (moduleName) => {
    return logger.child({ module: moduleName });
};

module.exports = { logger, createLogger };
