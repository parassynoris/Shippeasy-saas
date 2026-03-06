const crypto = require('crypto');

/**
 * API Key authentication middleware for service-to-service communication.
 *
 * Validates requests using a pre-shared API key passed via the `x-api-key` header.
 * This is intended for internal service calls, webhooks from trusted partners,
 * and automated integrations that don't use user-level JWT authentication.
 *
 * Configuration:
 *   - API_KEYS: Comma-separated list of valid API keys (env var)
 *   - Each key should be at least 32 characters of cryptographically random data
 *
 * Usage:
 *   router.post('/internal/sync', apiKeyAuth, controller);
 */

/**
 * Parse API keys from environment variable.
 * Supports multiple keys for rotation (comma-separated).
 */
function getValidApiKeys() {
    const keysStr = process.env.API_KEYS || '';
    return keysStr.split(',').map(k => k.trim()).filter(k => k.length > 0);
}

/**
 * Timing-safe comparison of API key to prevent timing attacks.
 */
function safeCompare(provided, expected) {
    if (typeof provided !== 'string' || typeof expected !== 'string') {
        return false;
    }
    if (provided.length !== expected.length) {
        return false;
    }
    return crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

/**
 * Middleware: Require valid API key in `x-api-key` header.
 */
function apiKeyAuth(req, res, next) {
    const providedKey = req.headers['x-api-key'];

    if (!providedKey) {
        return res.status(401).json({
            error: {
                code: 'API_KEY_MISSING',
                message: 'API key is required. Provide it via the x-api-key header.',
            }
        });
    }

    const validKeys = getValidApiKeys();

    if (validKeys.length === 0) {
        console.error(JSON.stringify({
            traceId: req?.traceId,
            event: 'API_KEY_NOT_CONFIGURED',
            message: 'API_KEYS environment variable is not set. Service-to-service auth is disabled.',
            timestamp: new Date().toISOString(),
        }));
        return res.status(503).json({
            error: {
                code: 'API_KEY_NOT_CONFIGURED',
                message: 'API key authentication is not configured on this server.',
            }
        });
    }

    const isValid = validKeys.some(key => safeCompare(providedKey, key));

    if (!isValid) {
        console.warn(JSON.stringify({
            traceId: req?.traceId,
            event: 'API_KEY_INVALID',
            ip: req.ip,
            timestamp: new Date().toISOString(),
        }));
        return res.status(403).json({
            error: {
                code: 'API_KEY_INVALID',
                message: 'Invalid API key.',
            }
        });
    }

    // Mark request as service-authenticated
    req.isServiceAuth = true;
    next();
}

/**
 * Middleware: Accept either JWT user auth OR API key.
 * Useful for endpoints that need to work for both users and internal services.
 */
function apiKeyOrAuth(validateAuthFn) {
    return (req, res, next) => {
        const apiKey = req.headers['x-api-key'];

        if (apiKey) {
            return apiKeyAuth(req, res, next);
        }

        // Fall through to user auth
        return validateAuthFn(req, res, next);
    };
}

module.exports = {
    apiKeyAuth,
    apiKeyOrAuth,
    getValidApiKeys,
};
