/**
 * Webhook signature verification middleware.
 * 
 * Validates incoming webhook requests using HMAC-SHA256 signatures
 * to ensure they originate from trusted sources.
 */
const crypto = require('crypto');

/**
 * Verify WhatsApp webhook signature (X-Hub-Signature-256 header).
 * WhatsApp uses HMAC-SHA256 with the app secret as the key.
 * 
 * Requires raw body to be available as req.rawBody (set up in index.js via
 * express.json verify callback).
 * 
 * @see https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
 */
function verifyWhatsAppSignature(req, res, next) {
    const appSecret = process.env.WHATSAPP_APP_SECRET;

    // If no secret is configured, log warning and allow (for backward compatibility during rollout)
    if (!appSecret) {
        console.warn(JSON.stringify({
            traceId: req?.traceId,
            warning: 'WHATSAPP_APP_SECRET not configured — webhook signature verification skipped',
            timestamp: new Date().toISOString()
        }));
        return next();
    }

    const signature = req.headers['x-hub-signature-256'];
    if (!signature) {
        console.warn(JSON.stringify({
            traceId: req?.traceId,
            warning: 'Missing X-Hub-Signature-256 header on WhatsApp webhook',
            timestamp: new Date().toISOString()
        }));
        return res.status(401).json({ error: 'Missing webhook signature' });
    }

    // Use raw body bytes for accurate HMAC verification (not re-serialized JSON)
    const rawBody = req.rawBody || JSON.stringify(req.body);
    const expectedSignature = 'sha256=' + crypto
        .createHmac('sha256', appSecret)
        .update(rawBody)
        .digest('hex');

    const signatureBuffer = Buffer.from(signature, 'utf8');
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

    if (signatureBuffer.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
        console.error(JSON.stringify({
            traceId: req?.traceId,
            error: 'Invalid WhatsApp webhook signature',
            timestamp: new Date().toISOString()
        }));
        return res.status(403).json({ error: 'Invalid webhook signature' });
    }

    next();
}

/**
 * Verify OceanIO webhook signature.
 * Uses HMAC-SHA256 with a shared secret via X-Webhook-Signature header.
 * 
 * Requires raw body to be available as req.rawBody (set up in index.js via
 * express.json verify callback).
 */
function verifyOceanIOSignature(req, res, next) {
    const webhookSecret = process.env.OCEANIO_WEBHOOK_SECRET;

    // If no secret is configured, log warning and allow (backward compatibility)
    if (!webhookSecret) {
        console.warn(JSON.stringify({
            traceId: req?.traceId,
            warning: 'OCEANIO_WEBHOOK_SECRET not configured — webhook signature verification skipped',
            timestamp: new Date().toISOString()
        }));
        return next();
    }

    const signature = req.headers['x-webhook-signature'] || req.headers['x-signature'];
    if (!signature) {
        console.warn(JSON.stringify({
            traceId: req?.traceId,
            warning: 'Missing webhook signature header on OceanIO webhook',
            timestamp: new Date().toISOString()
        }));
        return res.status(401).json({ error: 'Missing webhook signature' });
    }

    // Use raw body bytes for accurate HMAC verification
    const rawBody = req.rawBody || JSON.stringify(req.body);
    const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

    const signatureBuffer = Buffer.from(signature, 'utf8');
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

    if (signatureBuffer.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
        console.error(JSON.stringify({
            traceId: req?.traceId,
            error: 'Invalid OceanIO webhook signature',
            timestamp: new Date().toISOString()
        }));
        return res.status(403).json({ error: 'Invalid webhook signature' });
    }

    next();
}

module.exports = {
    verifyWhatsAppSignature,
    verifyOceanIOSignature,
};
