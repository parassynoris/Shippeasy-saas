require('dotenv').config({ path: '.env' })

const requestTracer = require('./middleware/requestTracer')
const express = require('express');
const compression = require('compression');
const app = express();
const cors = require('cors');
const { securityHeaders, apiLimiter, sanitizeInput } = require('./middleware/security');

// ── Security headers (helmet) ───────────────────────────────────
app.use(securityHeaders);

// ── Response compression ────────────────────────────────────────
app.use(compression());

// ── CORS ────────────────────────────────────────────────────────
const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map(o => o.trim()) : [];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'frontend-trace-id'],
  credentials: true
}));

// ── Body parsing with reduced default limit ─────────────────────
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: false }));

// ── NoSQL injection prevention ──────────────────────────────────
app.use(sanitizeInput);

// ── Request tracing ─────────────────────────────────────────────
app.use(requestTracer);

// ── General API rate limiter ────────────────────────────────────
app.use(apiLimiter);

const http = require('http').createServer(app);

// ── APM Configuration ───────────────────────────────────────────
const isProduction = process.env.NODE_ENV === 'production';
const apm = require('elastic-apm-node').start({
	serviceName: 'shipeasy-api',
	serverUrl: process.env.APM_SERVER,
	environment: process.env.ENVIRONMENT,
	captureBody: isProduction ? 'errors' : 'all',
	captureHeaders: true, 
	captureErrors: true, 
	transactionSampleRate: isProduction ? 0.1 : 1.0,
});

const socketHelper = require('./service/socketHelper');
try{
	socketHelper.init(http);
} catch (err) {
	console.error(JSON.stringify({
		error: err,
		stack : err?.stack
	}))
}

const PORT = process.env.PORT || 3000;
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
	definition: {
		components: {
			securitySchemes: {
			  bearerAuth: {
				type: 'http',
				in: 'header',
				name: 'Authorization',
				description: 'Bearer token to access these api endpoints',
				scheme: 'bearer',
				bearerFormat: 'JWT',
			  },
			},
		  },
		  security: [
			{
			  bearerAuth: [],
			},
		  ],
		openapi: "3.1.0",
		info: {
			title: "Stolt Endpoints",
			version: "0.1.0",
			description:
				"This is a STOLT's API application made with Express and documented with Swagger",
		
		},
		servers: [
		{
			url: "http://localhost:3000/api",
		},
		],
	},
	apis: ["./router/*.js"],
};

const specs = swaggerJsdoc(options);

const mongo = require('./service/mongooseConnection');
mongo.connectToDatabase();

const { verificationWebhookWhatsapp } = require('./controller/whatsapp.controller');
const { webhookWhatsapp } = require('./controller/webhooks.controller');

// CORS is handled by the cors() middleware above


app.get('/webhook', [ verificationWebhookWhatsapp])
app.post('/webhook', [ webhookWhatsapp])

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date()
    });
});

app.get('/version', (req, res) => {
	const nodeVersion = process.version;
	
    res.status(200).json({ 
        status: 'OK', 
        nodeVersion: nodeVersion
    });
});

app.use((req, res, next) => {
    const transaction = apm.currentTransaction;

    if (transaction && req.userId) {
        // Attach user-specific data to the current transaction
        apm.setUserContext({
            id: req.userId,
            username: req.username || 'Guest'
        });

		if(req.traceId) {
			transaction.addLabels({
                traceId: req.traceId,
				frontendTraceId : req?.frontendTraceId
            });
		}
    }

    next();
});

app.use('/api', require('./router/route'));

app.use(
	"/api-docs",
	swaggerUi.serve,
	swaggerUi.setup(specs, { explorer: true, cors: true })
);

// Global error handling middleware
app.use((err, req, res, next) => {
	console.error(JSON.stringify({
		traceId: req?.traceId,
		error: err.message,
		stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
		timestamp: new Date().toISOString()
	}));
	res.status(err.status || 500).json({
		error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
		traceId: req?.traceId
	});
});

console.log(`[${new Date().toISOString()}] Starting the server...`);

http.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Server is listening on port ${PORT}`);
}).on('error', (err) => {
  console.log(`[${new Date().toISOString()}] Server error: ${err}`);
});

const schedulers = require('./service/schedulers')

module.exports = app