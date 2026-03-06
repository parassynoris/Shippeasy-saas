const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const requestContext = require('../service/requestContext');

const excludedEndpoints = [
    '/pdf/download',
    '/uploadfile',
    '/downloadfile',
    '/health',
];

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_LENGTH = 16;

function encrypt(text) {
    if (!ENCRYPTION_KEY) throw new Error('ENCRYPTION_KEY not configured');
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    if (!ENCRYPTION_KEY) throw new Error('ENCRYPTION_KEY not configured');
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

const SENSITIVE_HEADERS = new Set([
    'authorization', 'cookie', 'x-api-key',
]);

function sanitizeHeaders(headers) {
    const sanitized = {};
    for (const [key, value] of Object.entries(headers)) {
        sanitized[key] = SENSITIVE_HEADERS.has(key.toLowerCase()) ? '[REDACTED]' : value;
    }
    return sanitized;
}

const requestTracer = (req, res, next) => {
    const traceId = uuidv4();

    requestContext.run(traceId, () => {
        req.traceId = traceId;
        req.frontendTraceId = req.headers['frontend-trace-id'];

        const contentType = req.headers['content-type'];

        if (
            process.env.ENCRYPTION === 'true'
            && ENCRYPTION_KEY
            && contentType && contentType.includes('text/plain')
            && !excludedEndpoints.some(ep => req.path.includes(ep))
        ) {
            if (req.body && typeof req.body === 'string') {
                try {
                    req.body = decrypt(req.body);
                    try {
                        req.body = JSON.parse(req.body);
                    } catch (_) { /* body is not JSON — leave as string */ }
                } catch (error) {
                    return res.status(400).json({ error: 'Invalid encrypted data' });
                }
            }
        }

        try {
            const authHeader = req.headers.authorization;
            if (authHeader) {
                const token = authHeader.startsWith('Bearer ')
                    ? authHeader.slice(7)
                    : authHeader;
                const decoded = jwt.verify(token, process.env.SECRET_KEY_JWT);
                req.userId = decoded.user.id;
                req.username = decoded.user.username;
            }
        } catch (_) { /* token is invalid or missing — auth middleware will handle */ }

        res.setHeader('X-Trace-Id', req.traceId);

        if (process.env.NODE_ENV !== 'production') {
            console.info(JSON.stringify({
                traceId: req.traceId,
                method: req.method,
                url: req.url,
                timestamp: new Date().toISOString(),
                userId: req.userId,
            }));
        }

        const originalSend = res.send;
        res.send = function (body) {
            if (
                process.env.ENCRYPTION === 'true'
                && ENCRYPTION_KEY
                && !excludedEndpoints.some(ep => req.path.includes(ep))
            ) {
                if (typeof body === 'object') {
                    body = JSON.stringify(body);
                }
                const encryptedBody = encrypt(body);
                return originalSend.call(this, encryptedBody);
            }
            return originalSend.call(this, body);
        };

        next();
    });
};

module.exports = requestTracer;
