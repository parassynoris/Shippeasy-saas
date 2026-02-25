require('dotenv').config({ path: '.env' })

const requestTracer = require('./middleware/requestTracer')
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: false }));
// app.use(express.text({ type: '*/*' })); 
app.use(requestTracer);

const http = require('http').createServer(app);

const apm = require('elastic-apm-node').start({
	serviceName: 'shipeasy-api',
	serverUrl: process.env.APM_SERVER,
	environment: process.env.ENVIRONMENT,
	captureBody: 'all',
	captureHeaders: true, 
	captureErrors: true, 
	transactionSampleRate: 1.0,
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

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*'); // Replace '*' with the specific origin you want to allow
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	next();
});


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

console.log(`[${new Date().toISOString()}] Starting the server...`);

http.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Server is listening on port ${PORT}`);
}).on('error', (err) => {
  console.log(`[${new Date().toISOString()}] Server error: ${err}`);
});

const schedulers = require('./service/schedulers')

module.exports = app