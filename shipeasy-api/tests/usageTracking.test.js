/**
 * Unit tests for per-tenant rate limiting and usage metering middleware
 */
const { tenantRateLimit, usageMetering, PLAN_RATE_LIMITS } = require('../middleware/usageTracking');

// Mock response helper
function mockRes() {
    const headers = {};
    const res = {
        statusCode: 200,
        body: null,
        locals: {},
        status(code) { res.statusCode = code; return res; },
        json(data) { res.body = data; return res; },
        setHeader(name, value) { headers[name] = value; },
        getHeader(name) { return headers[name]; },
        on(event, fn) { /* stub */ },
        get(name) { return headers[name]; },
    };
    return res;
}

describe('Usage Tracking', () => {
    describe('PLAN_RATE_LIMITS', () => {
        it('should define limits for all plan tiers', () => {
            expect(PLAN_RATE_LIMITS).toHaveProperty('free');
            expect(PLAN_RATE_LIMITS).toHaveProperty('pro');
            expect(PLAN_RATE_LIMITS).toHaveProperty('enterprise');
        });

        it('should have progressively higher limits', () => {
            expect(PLAN_RATE_LIMITS.free).toBeLessThan(PLAN_RATE_LIMITS.pro);
            expect(PLAN_RATE_LIMITS.pro).toBeLessThan(PLAN_RATE_LIMITS.enterprise);
        });
    });

    describe('tenantRateLimit', () => {
        it('should call next() when no user is authenticated', () => {
            const req = {};
            const res = mockRes();
            res.locals = {};
            const next = jest.fn();

            tenantRateLimit(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('should call next() when user has no orgId', () => {
            const req = {};
            const res = mockRes();
            res.locals = { user: {} };
            const next = jest.fn();

            tenantRateLimit(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('should set rate limit headers', () => {
            const req = {};
            const res = mockRes();
            res.locals = { user: { orgId: 'test-org-headers' }, agent: { plan: 'free' } };
            const next = jest.fn();

            tenantRateLimit(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(res.getHeader('X-RateLimit-Limit')).toBe(PLAN_RATE_LIMITS.free);
        });

        it('should allow requests within rate limit', () => {
            const next = jest.fn();
            const orgId = 'test-org-within-limit-' + Date.now();

            for (let i = 0; i < 5; i++) {
                const req = {};
                const res = mockRes();
                res.locals = { user: { orgId }, agent: { plan: 'free' } };
                tenantRateLimit(req, res, next);
            }

            // All 5 should have been allowed
            expect(next).toHaveBeenCalledTimes(5);
        });
    });

    describe('usageMetering', () => {
        it('should call next() when no user is authenticated', () => {
            const req = {};
            const res = mockRes();
            res.locals = {};
            const next = jest.fn();

            usageMetering(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('should call next() and register finish handler', () => {
            const onHandlers = {};
            const req = { method: 'POST', route: { path: '/test' } };
            const res = mockRes();
            res.locals = { user: { orgId: 'meter-org', userId: 'user1' } };
            res.on = (event, fn) => { onHandlers[event] = fn; };
            const next = jest.fn();

            usageMetering(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(onHandlers).toHaveProperty('finish');
        });
    });
});
