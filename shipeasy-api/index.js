require('dotenv').config({ path: '.env' });

const express = require('express');
const cors = require('cors');
const http = require('http');

const {
    helmetMiddleware,
    corsConfig,
    globalLimiter,
    sanitizeInput,
    preventParamPollution,
} = require('./middleware/security');
const requestTracer = require('./middleware/requestTracer');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

const app = express();

// ---------------------------------------------------------------------------
// Security middleware (applied before anything else)
// ---------------------------------------------------------------------------
app.use(helmetMiddleware);
app.use(cors(corsConfig()));
app.use(globalLimiter);

// ---------------------------------------------------------------------------
// Body parsing with sensible limits
// ---------------------------------------------------------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// ---------------------------------------------------------------------------
// Input sanitisation (NoSQL injection, parameter pollution)
// ---------------------------------------------------------------------------
app.use(sanitizeInput);
app.use(preventParamPollution);

// ---------------------------------------------------------------------------
// Request tracing
// ---------------------------------------------------------------------------
app.use(requestTracer);

// ---------------------------------------------------------------------------
// HTTP server for Express + Socket.io
// ---------------------------------------------------------------------------
const server = http.createServer(app);

// ---------------------------------------------------------------------------
// Elastic APM
// ---------------------------------------------------------------------------
const apm = require('elastic-apm-node').start({
    serviceName: 'shipeasy-api',
    serverUrl: process.env.APM_SERVER,
    environment: process.env.ENVIRONMENT,
    captureBody: process.env.NODE_ENV === 'production' ? 'errors' : 'all',
    captureHeaders: true,
    captureErrors: true,
    transactionSampleRate: process.env.NODE_ENV === 'production' ? 0.5 : 1.0,
});

// ---------------------------------------------------------------------------
// Socket.io
// ---------------------------------------------------------------------------
const socketHelper = require('./service/socketHelper');
try {
    socketHelper.init(server);
} catch (err) {
    const logger = require('./utils/logger');
    logger.error('Socket.io initialization failed', { error: err.message, stack: err.stack });
}

// ---------------------------------------------------------------------------
// Database + indexes
// ---------------------------------------------------------------------------
const mongo = require('./service/mongooseConnection');
mongo.connectToDatabase();

const { applyIndexes } = require('./schema/indexes');
applyIndexes();

// ---------------------------------------------------------------------------
// Swagger
// ---------------------------------------------------------------------------
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    definition: {
        openapi: '3.1.0',
        info: {
            title: 'Shippeasy API',
            version: '1.0.0',
            description: 'Shippeasy SaaS API documentation',
        },
        servers: [{ url: `http://localhost:${process.env.PORT || 3000}/api` }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./router/*.js'],
};

const specs = swaggerJsdoc(swaggerOptions);

// ---------------------------------------------------------------------------
// WhatsApp webhooks (before auth — external service callbacks)
// ---------------------------------------------------------------------------
const { verificationWebhookWhatsapp } = require('./controller/whatsapp.controller');
const { webhookWhatsapp } = require('./controller/webhooks.controller');

app.get('/webhook', verificationWebhookWhatsapp);
app.post('/webhook', webhookWhatsapp);

// ---------------------------------------------------------------------------
// Health & version (unauthenticated)
// ---------------------------------------------------------------------------
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

app.get('/version', (req, res) => {
    res.status(200).json({
        status: 'OK',
        nodeVersion: process.version,
        environment: process.env.ENVIRONMENT || 'unknown',
    });
});

// ---------------------------------------------------------------------------
// APM user context attachment
// ---------------------------------------------------------------------------
app.use((req, res, next) => {
    const transaction = apm.currentTransaction;
    if (transaction && req.userId) {
        apm.setUserContext({
            id: req.userId,
            username: req.username || 'Guest',
        });
        if (req.traceId) {
            transaction.addLabels({
                traceId: req.traceId,
                frontendTraceId: req.frontendTraceId,
            });
        }
    }
    next();
});

// ---------------------------------------------------------------------------
// API routes
// ---------------------------------------------------------------------------
app.use('/api', require('./router'));

// ---------------------------------------------------------------------------
// Swagger UI (only in non-production or with explicit opt-in)
// ---------------------------------------------------------------------------
if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));
}

// ---------------------------------------------------------------------------
// Error handling (must be last)
// ---------------------------------------------------------------------------
app.use(notFoundHandler);
app.use(globalErrorHandler);

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 3000;
const logger = require('./utils/logger');

server.listen(PORT, () => {
    logger.info(`Server is listening on port ${PORT}`);
}).on('error', (err) => {
    logger.error(`Server error: ${err.message}`);
    process.exit(1);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
    logger.info(`${signal} received. Starting graceful shutdown...`);
    server.close(() => {
        logger.info('HTTP server closed');
        const mongoose = require('mongoose');
        mongoose.connection.close(false).then(() => {
            logger.info('MongoDB connection closed');
            process.exit(0);
        });
    });
    setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
    }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection', { reason: reason?.message || reason });
});
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
    process.exit(1);
});

// Background schedulers
require('./service/schedulers');

module.exports = app;
