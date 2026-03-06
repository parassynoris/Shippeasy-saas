/**
 * Per-tenant rate limiting and usage metering middleware.
 *
 * Tracks API usage per organization and enforces tenant-level rate limits
 * based on their subscription plan.
 */

/**
 * In-memory store for per-tenant rate limiting.
 * In production, this should be backed by Redis for multi-instance deployments.
 */
const tenantUsage = new Map();

/**
 * Default rate limits per plan tier (requests per 15-minute window).
 */
const PLAN_RATE_LIMITS = {
    free: 100,
    pro: 1000,
    enterprise: 10000,
};

/**
 * Clean up expired entries periodically (every 15 minutes).
 */
const WINDOW_MS = 15 * 60 * 1000;
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of tenantUsage.entries()) {
        if (now - value.windowStart > WINDOW_MS) {
            tenantUsage.delete(key);
        }
    }
}, WINDOW_MS);

/**
 * Per-tenant rate limiting middleware.
 *
 * Enforces rate limits based on the tenant's subscription plan.
 * Falls back to 'free' tier limits if plan is unknown.
 * Must be placed AFTER auth middleware (requires res.locals.user).
 */
function tenantRateLimit(req, res, next) {
    const user = res.locals.user;
    const agent = res.locals.agent;

    // Skip if no authenticated user
    if (!user || !user.orgId) {
        return next();
    }

    const orgId = user.orgId;
    const plan = agent?.plan || 'free';
    const limit = PLAN_RATE_LIMITS[plan] || PLAN_RATE_LIMITS.free;
    const now = Date.now();

    let record = tenantUsage.get(orgId);
    if (!record || (now - record.windowStart > WINDOW_MS)) {
        record = { windowStart: now, count: 0 };
        tenantUsage.set(orgId, record);
    }

    record.count++;

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - record.count));
    res.setHeader('X-RateLimit-Reset', new Date(record.windowStart + WINDOW_MS).toISOString());

    if (record.count > limit) {
        console.warn(JSON.stringify({
            traceId: req?.traceId,
            event: 'TENANT_RATE_LIMIT_EXCEEDED',
            orgId,
            plan,
            limit,
            count: record.count,
            timestamp: new Date().toISOString()
        }));

        return res.status(429).json({
            error: {
                code: 'TENANT_RATE_LIMIT_EXCEEDED',
                message: 'Your organization has exceeded the API rate limit. Please upgrade your plan or try again later.',
                retryAfter: Math.ceil((record.windowStart + WINDOW_MS - now) / 1000),
            }
        });
    }

    next();
}

/**
 * Usage metering middleware.
 *
 * Logs API usage per tenant for billing and analytics purposes.
 * Emits structured log entries that can be consumed by log aggregation systems.
 * Must be placed AFTER auth middleware.
 */
function usageMetering(req, res, next) {
    const user = res.locals.user;

    if (!user || !user.orgId) {
        return next();
    }

    // Record the start time
    const startTime = Date.now();

    // Hook into response finish to capture final metrics
    res.on('finish', () => {
        const duration = Date.now() - startTime;

        // Structured usage log — parseable by ELK/CloudWatch/Datadog
        console.log(JSON.stringify({
            event: 'api_usage',
            orgId: user.orgId,
            userId: user.userId,
            method: req.method,
            path: req.route?.path || 'unknown',
            statusCode: res.statusCode,
            duration,
            contentLength: res.get('Content-Length') || 0,
            timestamp: new Date().toISOString(),
        }));
    });

    next();
}

module.exports = {
    tenantRateLimit,
    usageMetering,
    PLAN_RATE_LIMITS,
};
