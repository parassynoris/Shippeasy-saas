/**
 * Unit tests for plan enforcement middleware
 */
const { checkPlanAccess, PLAN_FEATURES, ALWAYS_ALLOWED, getMinimumPlanForFeature } = require('../middleware/planEnforcement');

// Mock response helper
function mockRes() {
    const res = {
        statusCode: 200,
        body: null,
        locals: {},
        status(code) { res.statusCode = code; return res; },
        json(data) { res.body = data; return res; },
    };
    return res;
}

describe('Plan Enforcement Middleware', () => {
    const originalEnv = process.env.PLAN_ENFORCEMENT;

    afterEach(() => {
        if (originalEnv !== undefined) {
            process.env.PLAN_ENFORCEMENT = originalEnv;
        } else {
            delete process.env.PLAN_ENFORCEMENT;
        }
    });

    describe('PLAN_FEATURES definition', () => {
        it('should define free, pro, and enterprise tiers', () => {
            expect(PLAN_FEATURES).toHaveProperty('free');
            expect(PLAN_FEATURES).toHaveProperty('pro');
            expect(PLAN_FEATURES).toHaveProperty('enterprise');
        });

        it('should give enterprise unlimited access', () => {
            expect(PLAN_FEATURES.enterprise.features).toContain('*');
            expect(PLAN_FEATURES.enterprise.maxUsers).toBe(-1);
        });

        it('should give free tier limited features', () => {
            expect(PLAN_FEATURES.free.maxUsers).toBe(3);
            expect(PLAN_FEATURES.free.features).toContain('quotation');
            expect(PLAN_FEATURES.free.features).not.toContain('edi');
        });

        it('should give pro tier more features than free', () => {
            expect(PLAN_FEATURES.pro.features.length).toBeGreaterThan(PLAN_FEATURES.free.features.length);
            expect(PLAN_FEATURES.pro.features).toContain('edi');
            expect(PLAN_FEATURES.pro.features).toContain('einvoice');
        });
    });

    describe('ALWAYS_ALLOWED collections', () => {
        it('should include reference data collections', () => {
            expect(ALWAYS_ALLOWED).toContain('country');
            expect(ALWAYS_ALLOWED).toContain('currency');
            expect(ALWAYS_ALLOWED).toContain('role');
        });
    });

    describe('getMinimumPlanForFeature', () => {
        it('should return "free" for quotation', () => {
            expect(getMinimumPlanForFeature('quotation')).toBe('free');
        });

        it('should return "pro" for edi', () => {
            expect(getMinimumPlanForFeature('edi')).toBe('pro');
        });

        it('should return "enterprise" for unknown features', () => {
            expect(getMinimumPlanForFeature('unknown_feature')).toBe('enterprise');
        });
    });

    describe('checkPlanAccess middleware', () => {
        it('should allow access when no agent data exists', () => {
            const req = { params: { indexName: 'edi' } };
            const res = mockRes();
            res.locals = { user: { orgId: 'org1' } };
            const next = jest.fn();

            checkPlanAccess(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('should allow access when no plan is set on agent', () => {
            const req = { params: { indexName: 'edi' } };
            const res = mockRes();
            res.locals = { user: { orgId: 'org1' }, agent: {} };
            const next = jest.fn();

            checkPlanAccess(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('should allow enterprise access to any feature', () => {
            const req = { params: { indexName: 'edi' } };
            const res = mockRes();
            res.locals = { user: { orgId: 'org1' }, agent: { plan: 'enterprise' } };
            const next = jest.fn();

            checkPlanAccess(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('should allow free-tier access to quotation', () => {
            const req = { params: { indexName: 'quotation' } };
            const res = mockRes();
            res.locals = { user: { orgId: 'org1' }, agent: { plan: 'free' } };
            const next = jest.fn();

            checkPlanAccess(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('should allow access to always-allowed collections regardless of plan', () => {
            const req = { params: { indexName: 'country' } };
            const res = mockRes();
            res.locals = { user: { orgId: 'org1' }, agent: { plan: 'free' } };
            const next = jest.fn();

            checkPlanAccess(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('should SOFT block (allow) when free-tier accesses pro feature (default mode)', () => {
            delete process.env.PLAN_ENFORCEMENT;
            const req = { params: { indexName: 'edi' }, traceId: 'test-trace' };
            const res = mockRes();
            res.locals = { user: { orgId: 'org1' }, agent: { plan: 'free' } };
            const next = jest.fn();

            // Capture console.log
            const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
            checkPlanAccess(req, res, next);
            logSpy.mockRestore();

            expect(next).toHaveBeenCalled(); // soft — allows access
        });

        it('should HARD block when free-tier accesses pro feature in hard mode', () => {
            process.env.PLAN_ENFORCEMENT = 'hard';
            const req = { params: { indexName: 'edi' }, traceId: 'test-trace' };
            const res = mockRes();
            res.locals = { user: { orgId: 'org1' }, agent: { plan: 'free' } };
            const next = jest.fn();

            const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
            checkPlanAccess(req, res, next);
            logSpy.mockRestore();

            expect(next).not.toHaveBeenCalled();
            expect(res.statusCode).toBe(403);
            expect(res.body.error.code).toBe('PLAN_FEATURE_RESTRICTED');
            expect(res.body.error.currentPlan).toBe('free');
        });
    });
});
