/**
 * Unit tests for webhook authentication middleware
 */
const crypto = require('crypto');
const { verifyWhatsAppSignature, verifyOceanIOSignature } = require('../middleware/webhookAuth');

// Mock response helper
function mockRes() {
    const res = {
        statusCode: 200,
        body: null,
        status(code) { res.statusCode = code; return res; },
        json(data) { res.body = data; return res; },
        sendStatus(code) { res.statusCode = code; return res; },
    };
    return res;
}

describe('Webhook Authentication', () => {
    describe('verifyWhatsAppSignature', () => {
        const originalSecret = process.env.WHATSAPP_APP_SECRET;

        afterEach(() => {
            if (originalSecret !== undefined) {
                process.env.WHATSAPP_APP_SECRET = originalSecret;
            } else {
                delete process.env.WHATSAPP_APP_SECRET;
            }
        });

        it('should skip verification when WHATSAPP_APP_SECRET is not set', () => {
            delete process.env.WHATSAPP_APP_SECRET;
            const req = { headers: {}, rawBody: '{}' };
            const res = mockRes();
            const next = jest.fn();

            verifyWhatsAppSignature(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('should return 401 when signature header is missing', () => {
            process.env.WHATSAPP_APP_SECRET = 'test-secret';
            const req = { headers: {}, rawBody: '{}' };
            const res = mockRes();
            const next = jest.fn();

            verifyWhatsAppSignature(req, res, next);
            expect(res.statusCode).toBe(401);
            expect(next).not.toHaveBeenCalled();
        });

        it('should return 403 for invalid signature', () => {
            process.env.WHATSAPP_APP_SECRET = 'test-secret';
            const body = '{"test":"data"}';
            const req = {
                headers: { 'x-hub-signature-256': 'sha256=invalidsignature' },
                rawBody: body,
            };
            const res = mockRes();
            const next = jest.fn();

            verifyWhatsAppSignature(req, res, next);
            expect(res.statusCode).toBe(403);
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next() for valid HMAC-SHA256 signature', () => {
            const secret = 'test-whatsapp-secret';
            process.env.WHATSAPP_APP_SECRET = secret;
            const body = '{"test":"data"}';
            const expectedSig = 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex');

            const req = {
                headers: { 'x-hub-signature-256': expectedSig },
                rawBody: body,
            };
            const res = mockRes();
            const next = jest.fn();

            verifyWhatsAppSignature(req, res, next);
            expect(next).toHaveBeenCalled();
        });
    });

    describe('verifyOceanIOSignature', () => {
        const originalSecret = process.env.OCEANIO_WEBHOOK_SECRET;

        afterEach(() => {
            if (originalSecret !== undefined) {
                process.env.OCEANIO_WEBHOOK_SECRET = originalSecret;
            } else {
                delete process.env.OCEANIO_WEBHOOK_SECRET;
            }
        });

        it('should skip verification when OCEANIO_WEBHOOK_SECRET is not set', () => {
            delete process.env.OCEANIO_WEBHOOK_SECRET;
            const req = { headers: {}, rawBody: '{}' };
            const res = mockRes();
            const next = jest.fn();

            verifyOceanIOSignature(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('should return 401 when signature header is missing', () => {
            process.env.OCEANIO_WEBHOOK_SECRET = 'test-secret';
            const req = { headers: {}, rawBody: '{}' };
            const res = mockRes();
            const next = jest.fn();

            verifyOceanIOSignature(req, res, next);
            expect(res.statusCode).toBe(401);
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next() for valid signature', () => {
            const secret = 'test-ocean-secret';
            process.env.OCEANIO_WEBHOOK_SECRET = secret;
            const body = '{"event":"tracking_update"}';
            const expectedSig = crypto.createHmac('sha256', secret).update(body).digest('hex');

            const req = {
                headers: { 'x-webhook-signature': expectedSig },
                rawBody: body,
            };
            const res = mockRes();
            const next = jest.fn();

            verifyOceanIOSignature(req, res, next);
            expect(next).toHaveBeenCalled();
        });
    });
});
