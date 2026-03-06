const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const requestContext = require('../service/requestContext')

const excludedEndpoints = [
	'/pdf/download',
	'/uploadfile',
	'/downloadfile',
    '/health'
];

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Must be 32 characters — set via environment variable
const IV_LENGTH = 16; // For AES, this is always 16

function encrypt(text) {
	let iv = crypto.randomBytes(IV_LENGTH);
	let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
	let encrypted = cipher.update(text);

	encrypted = Buffer.concat([encrypted, cipher.final()]);

	return iv.toString('hex') + ':' + encrypted.toString('hex');
}
function decrypt(text) {
    let textParts = text.split(':');
    let iv = Buffer.from(textParts.shift(), 'hex'); // Extract IV
    let encryptedText = Buffer.from(textParts.join(':'), 'hex'); // Extract encrypted data
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);

    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
}

const requestTracer = (req, res, next) => {
    const traceId = uuidv4();

    requestContext.run(traceId, () => {
        req.traceId = traceId; // Attach traceId to request object
        req.frontendTraceId = req.headers['frontend-trace-id']

    
        const contentType = req.headers['content-type'];

        // Only decrypt if the content type is 'text/plain' or another encrypted data type
        if ((process.env.ENCRYPTION === 'true') && !ENCRYPTION_KEY) {
            console.error(JSON.stringify({
                traceId: req?.traceId,
                error: 'ENCRYPTION is enabled but ENCRYPTION_KEY is not set in environment variables',
                timestamp: new Date().toISOString()
            }));
            return res.status(500).send({ error: 'Server encryption misconfiguration' });
        }

        if ((process.env.ENCRYPTION === 'true') && contentType && contentType.includes('text/plain') && (!excludedEndpoints.includes(req.path))) {
            if (req.body && typeof req.body === 'string') {
                try {
                    // Decrypt the incoming raw body (encrypted text)
                    req.body = decrypt(req.body);

                    // Optionally parse as JSON if expected
                    try {
                        req.body = JSON.parse(req.body);
                    } catch (err) {
                        console.error(JSON.stringify({
                            traceId : req?.traceId,
                            error: err,
                            stack : err?.stack
                        }))
                    }
                } catch (error) {
                    console.error(JSON.stringify({
                        userId : req.userId,
                        traceId: req.traceId,
                        method: req.method,
                        url: req.url,
                        timestamp: new Date().toISOString(),
                        headers: req.headers,
                        body: req.body
                    }));
                    
                    return res.status(400).send({ error: 'Invalid encrypted data' });
                }
            }
        }

        try {
            const decoded = jwt.verify(req.headers.authorization.replace("Bearer").slice(), process.env.SECRET_KEY_JWT);
            req.userId = decoded.user.id
            req.username = decoded.user.username
        } catch (err) {
            console.error(JSON.stringify({
                traceId : req?.traceId,
                error: err,
                stack : err?.stack
            }))
        }

        res.setHeader('X-Trace-Id', req.traceId);
        
        // Sanitize sensitive fields from logged body
        const sensitiveFields = ['Password', 'password', 'newPassword', 'currentPassword', 'token', 'accessToken', 'authorization'];
        function sanitizeBody(body) {
            if (!body || typeof body !== 'object') return body;
            const sanitized = { ...body };
            for (const field of sensitiveFields) {
                if (sanitized[field]) sanitized[field] = '[REDACTED]';
            }
            return sanitized;
        }

        // Log request (without sensitive data)
        console.log(JSON.stringify({
            userId : req.userId,
            traceId: req.traceId,
            method: req.method,
            url: req.url,
            timestamp: new Date().toISOString(),
            body: sanitizeBody(req.body)
        }));

        // Capture response using event listener
        const originalSend = res.send;
        res.send = function(body) {
            // Sanitize response body for logging
            let logBody = body;
            try {
                const parsed = typeof body === 'string' ? JSON.parse(body) : body;
                logBody = sanitizeBody(parsed);
            } catch (e) {
                // body is not JSON, log as-is (truncated)
                logBody = typeof body === 'string' && body.length > 500 ? body.substring(0, 500) + '...' : body;
            }

            console.log(JSON.stringify({
                userId : req.userId,
                traceId: req.traceId,
                responseTimestamp: new Date().toISOString(),
                statusCode: res.statusCode,
                responseBody: logBody
            }));

            if (process.env.ENCRYPTION === 'true' && (!excludedEndpoints.includes(req.path))) {
                // Check if body is a string, buffer, or an object
                if (typeof body === 'object') {
                    body = JSON.stringify(body);
                }

                // Encrypt the response body
                const encryptedBody = encrypt(body);

                // Call the original send function with the encrypted body
                return originalSend.call(this, encryptedBody);
            } else {
                return originalSend.call(this, body);
            }
        };

        next();
    })
};

module.exports = requestTracer; 