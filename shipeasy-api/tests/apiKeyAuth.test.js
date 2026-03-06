/**
 * Unit tests for API key authentication middleware
 */
const { apiKeyAuth, getValidApiKeys } = require('../middleware/apiKeyAuth');

// Mock response helper
function mockRes() {
    const res = {
        statusCode: 200,
        body: null,
        status(code) { res.statusCode = code; return res; },
        json(data) { res.body = data; return res; },
    };
    return res;
}

describe('API Key Authentication Middleware', () => {
    const originalEnv = process.env.API_KEYS;

    afterEach(() => {
        if (originalEnv !== undefined) {
            process.env.API_KEYS = originalEnv;
        } else {
            delete process.env.API_KEYS;
        }
    });

    describe('getValidApiKeys', () => {
        it('should return empty array when API_KEYS is not set', () => {
            delete process.env.API_KEYS;
            expect(getValidApiKeys()).toEqual([]);
        });

        it('should return empty array for empty string', () => {
            process.env.API_KEYS = '';
            expect(getValidApiKeys()).toEqual([]);
        });

        it('should parse single API key', () => {
            process.env.API_KEYS = 'test-key-12345678901234567890ab';
            expect(getValidApiKeys()).toEqual(['test-key-12345678901234567890ab']);
        });

        it('should parse multiple comma-separated API keys', () => {
            process.env.API_KEYS = 'key1-aaaabbbbccccddddeeeeffffgg,key2-hhhhiiiijjjjkkkkllllmmmmnnn';
            const keys = getValidApiKeys();
            expect(keys).toHaveLength(2);
            expect(keys[0]).toBe('key1-aaaabbbbccccddddeeeeffffgg');
            expect(keys[1]).toBe('key2-hhhhiiiijjjjkkkkllllmmmmnnn');
        });

        it('should trim whitespace from keys', () => {
            process.env.API_KEYS = ' key1-abcd , key2-efgh ';
            const keys = getValidApiKeys();
            expect(keys[0]).toBe('key1-abcd');
            expect(keys[1]).toBe('key2-efgh');
        });
    });

    describe('apiKeyAuth middleware', () => {
        it('should return 401 when no x-api-key header is provided', () => {
            const req = { headers: {} };
            const res = mockRes();
            const next = jest.fn();

            apiKeyAuth(req, res, next);

            expect(res.statusCode).toBe(401);
            expect(res.body.error.code).toBe('API_KEY_MISSING');
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 503 when API_KEYS env var is not configured', () => {
            delete process.env.API_KEYS;
            const req = { headers: { 'x-api-key': 'some-key' } };
            const res = mockRes();
            const next = jest.fn();

            apiKeyAuth(req, res, next);

            expect(res.statusCode).toBe(503);
            expect(res.body.error.code).toBe('API_KEY_NOT_CONFIGURED');
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 403 for invalid API key', () => {
            process.env.API_KEYS = 'valid-key-12345678901234567890';
            const req = { headers: { 'x-api-key': 'wrong-key-12345678901234567890' } };
            const res = mockRes();
            const next = jest.fn();

            apiKeyAuth(req, res, next);

            expect(res.statusCode).toBe(403);
            expect(res.body.error.code).toBe('API_KEY_INVALID');
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next() for valid API key', () => {
            process.env.API_KEYS = 'valid-key-12345678901234567890';
            const req = { headers: { 'x-api-key': 'valid-key-12345678901234567890' } };
            const res = mockRes();
            const next = jest.fn();

            apiKeyAuth(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(req.isServiceAuth).toBe(true);
        });

        it('should accept any of multiple configured keys', () => {
            process.env.API_KEYS = 'key1-aaaaaaaabbbbbbbbcccccccc,key2-ddddddddeeeeeeeefffffff';
            const next = jest.fn();

            // Test first key
            const req1 = { headers: { 'x-api-key': 'key1-aaaaaaaabbbbbbbbcccccccc' } };
            apiKeyAuth(req1, mockRes(), next);
            expect(next).toHaveBeenCalledTimes(1);

            // Test second key
            const req2 = { headers: { 'x-api-key': 'key2-ddddddddeeeeeeeefffffff' } };
            apiKeyAuth(req2, mockRes(), next);
            expect(next).toHaveBeenCalledTimes(2);
        });

        it('should reject key with different length (timing-safe)', () => {
            process.env.API_KEYS = 'exact-length-key-here-12345';
            const req = { headers: { 'x-api-key': 'short' } };
            const res = mockRes();
            const next = jest.fn();

            apiKeyAuth(req, res, next);

            expect(res.statusCode).toBe(403);
            expect(next).not.toHaveBeenCalled();
        });
    });
});
