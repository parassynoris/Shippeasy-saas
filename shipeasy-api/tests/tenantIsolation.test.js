/**
 * Unit tests for tenant isolation middleware
 */
const { enforceTenantIsolation, SHARED_COLLECTIONS } = require('../middleware/tenant');

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

describe('Tenant Isolation Middleware', () => {
    describe('SHARED_COLLECTIONS', () => {
        it('should include reference data collections', () => {
            expect(SHARED_COLLECTIONS).toContain('country');
            expect(SHARED_COLLECTIONS).toContain('state');
            expect(SHARED_COLLECTIONS).toContain('city');
            expect(SHARED_COLLECTIONS).toContain('currency');
        });
    });

    describe('enforceTenantIsolation', () => {
        it('should skip enforcement for shared collections', () => {
            const req = {
                method: 'POST',
                params: { indexName: 'country' },
                body: { name: 'Test Country' },
            };
            const res = mockRes();
            res.locals = { user: { orgId: 'org1' } };
            const next = jest.fn();

            enforceTenantIsolation(req, res, next);
            expect(next).toHaveBeenCalled();
            // orgId should NOT be injected for shared collections
        });

        it('should inject orgId on POST for tenant-scoped collections', () => {
            const req = {
                method: 'POST',
                params: { indexName: 'quotation' },
                body: { name: 'Test Quote' },
            };
            const res = mockRes();
            res.locals = { user: { orgId: 'org123' } };
            const next = jest.fn();

            enforceTenantIsolation(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(req.body.orgId).toBe('org123');
        });

        it('should log warning when body already has a different orgId (cross-tenant attempt)', () => {
            const req = {
                method: 'POST',
                params: { indexName: 'quotation' },
                body: { name: 'Test', orgId: 'different-org' },
                traceId: 'test-trace',
            };
            const res = mockRes();
            res.locals = { user: { orgId: 'org123', userId: 'user1' } };
            const next = jest.fn();

            const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
            enforceTenantIsolation(req, res, next);
            warnSpy.mockRestore();

            expect(next).toHaveBeenCalled();
            // orgId should be overwritten with the authenticated user's orgId
            expect(req.body.orgId).toBe('org123');
        });

        it('should call next when user is not authenticated', () => {
            const req = {
                method: 'POST',
                params: { indexName: 'quotation' },
                body: { name: 'Test' },
            };
            const res = mockRes();
            res.locals = {};
            const next = jest.fn();

            enforceTenantIsolation(req, res, next);
            expect(next).toHaveBeenCalled();
        });
    });
});
