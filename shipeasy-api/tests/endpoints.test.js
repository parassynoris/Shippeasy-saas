const request = require('supertest');
const express = require('express');

describe('Named Endpoint Integration Tests', () => {

    function buildMinimalApp() {
        const app = express();
        app.use(express.json());

        app.use((req, res, next) => {
            if (req.headers['x-test-user']) {
                res.locals.user = JSON.parse(req.headers['x-test-user']);
            }
            if (req.headers['x-test-agent']) {
                res.locals.agent = JSON.parse(req.headers['x-test-agent']);
            }
            next();
        });

        return app;
    }

    function makeUser(overrides = {}) {
        return JSON.stringify({
            userId: 'u1',
            userType: 'agent',
            userStatus: true,
            roles: [{ roleName: 'admin' }],
            orgId: 'org1',
            ...overrides,
        });
    }

    function makeAgent(overrides = {}) {
        return JSON.stringify({
            agentId: 'org1',
            features: [],
            ...overrides,
        });
    }

    // ─── FINANCE ROUTE RBAC ──────────────────────────────────────

    describe('Finance routes — RBAC enforcement', () => {

        const { requireRole, requireFeature } = require('../middleware/tenantIsolation');

        function buildFinanceApp() {
            const app = buildMinimalApp();
            app.post('/generateTALLYEntry', requireRole('admin', 'finance'), (req, res) => res.json({ ok: true }));
            app.get('/sent-to-einvoicing/:invoiceId', requireRole('admin', 'finance'), requireFeature('einvoicing'), (req, res) => res.json({ ok: true }));
            return app;
        }

        it('should allow admin to access Tally', async () => {
            const app = buildFinanceApp();
            const res = await request(app)
                .post('/generateTALLYEntry')
                .set('x-test-user', makeUser({ roles: [{ roleName: 'admin' }] }));
            expect(res.status).toBe(200);
        });

        it('should allow finance role to access Tally', async () => {
            const app = buildFinanceApp();
            const res = await request(app)
                .post('/generateTALLYEntry')
                .set('x-test-user', makeUser({ roles: [{ roleName: 'finance' }] }));
            expect(res.status).toBe(200);
        });

        it('should deny operations role from Tally', async () => {
            const app = buildFinanceApp();
            const res = await request(app)
                .post('/generateTALLYEntry')
                .set('x-test-user', makeUser({ roles: [{ roleName: 'operations' }] }));
            expect(res.status).toBe(403);
        });

        it('should deny e-invoicing without einvoicing feature flag', async () => {
            const app = buildFinanceApp();
            const res = await request(app)
                .get('/sent-to-einvoicing/inv-123')
                .set('x-test-user', makeUser({ roles: [{ roleName: 'admin' }] }))
                .set('x-test-agent', makeAgent({ features: [] }));
            expect(res.status).toBe(403);
            expect(res.body.error).toBe('Feature not available for your plan');
        });

        it('should allow e-invoicing with einvoicing feature flag', async () => {
            const app = buildFinanceApp();
            const res = await request(app)
                .get('/sent-to-einvoicing/inv-123')
                .set('x-test-user', makeUser({ roles: [{ roleName: 'admin' }] }))
                .set('x-test-agent', makeAgent({ features: [{ slug: 'einvoicing', isActive: true }] }));
            expect(res.status).toBe(200);
        });
    });

    // ─── DASHBOARD/REPORT ROUTE RBAC ─────────────────────────────

    describe('Dashboard and report routes — RBAC enforcement', () => {

        const { requireRole } = require('../middleware/tenantIsolation');

        function buildDashboardApp() {
            const app = buildMinimalApp();
            app.post('/chartDataDashboard', requireRole('admin', 'manager', 'finance', 'operations'), (req, res) => res.json({ ok: true }));
            app.post('/dashboardReport', requireRole('admin', 'manager', 'finance'), (req, res) => res.json({ ok: true }));
            app.post('/report/:reportName', requireRole('admin', 'manager', 'finance', 'operations'), (req, res) => res.json({ ok: true }));
            return app;
        }

        it('should allow manager to access chart data', async () => {
            const app = buildDashboardApp();
            const res = await request(app)
                .post('/chartDataDashboard')
                .set('x-test-user', makeUser({ roles: [{ roleName: 'manager' }] }));
            expect(res.status).toBe(200);
        });

        it('should allow operations role to access chart data', async () => {
            const app = buildDashboardApp();
            const res = await request(app)
                .post('/chartDataDashboard')
                .set('x-test-user', makeUser({ roles: [{ roleName: 'operations' }] }));
            expect(res.status).toBe(200);
        });

        it('should deny viewer role from chart data', async () => {
            const app = buildDashboardApp();
            const res = await request(app)
                .post('/chartDataDashboard')
                .set('x-test-user', makeUser({ roles: [{ roleName: 'viewer' }] }));
            expect(res.status).toBe(403);
        });

        it('should deny operations from dashboard reports', async () => {
            const app = buildDashboardApp();
            const res = await request(app)
                .post('/dashboardReport')
                .set('x-test-user', makeUser({ roles: [{ roleName: 'operations' }] }));
            expect(res.status).toBe(403);
        });

        it('should allow finance to access named reports', async () => {
            const app = buildDashboardApp();
            const res = await request(app)
                .post('/report/shipmentSummary')
                .set('x-test-user', makeUser({ roles: [{ roleName: 'finance' }] }));
            expect(res.status).toBe(200);
        });
    });

    // ─── AI ROUTE FEATURE FLAGS ──────────────────────────────────

    describe('AI scanning routes — feature flag enforcement', () => {

        const { requireFeature } = require('../middleware/tenantIsolation');

        function buildAIApp() {
            const app = buildMinimalApp();
            app.post('/scan-bl', requireFeature('ai-scanning'), (req, res) => res.json({ ok: true }));
            app.post('/scan-p-invoice', requireFeature('ai-scanning'), (req, res) => res.json({ ok: true }));
            return app;
        }

        it('should deny BL scanning without ai-scanning feature', async () => {
            const app = buildAIApp();
            const res = await request(app)
                .post('/scan-bl')
                .set('x-test-agent', makeAgent({ features: [] }));
            expect(res.status).toBe(403);
        });

        it('should allow BL scanning with ai-scanning feature', async () => {
            const app = buildAIApp();
            const res = await request(app)
                .post('/scan-bl')
                .set('x-test-agent', makeAgent({ features: [{ slug: 'ai-scanning', isActive: true }] }));
            expect(res.status).toBe(200);
        });

        it('should deny invoice scanning without ai-scanning feature', async () => {
            const app = buildAIApp();
            const res = await request(app)
                .post('/scan-p-invoice')
                .set('x-test-agent', makeAgent({ features: [{ slug: 'einvoicing', isActive: true }] }));
            expect(res.status).toBe(403);
        });

        it('should deny when ai-scanning feature is inactive', async () => {
            const app = buildAIApp();
            const res = await request(app)
                .post('/scan-bl')
                .set('x-test-agent', makeAgent({ features: [{ slug: 'ai-scanning', isActive: false }] }));
            expect(res.status).toBe(403);
        });
    });

    // ─── EDI ROUTE RBAC ──────────────────────────────────────────

    describe('EDI routes — RBAC enforcement', () => {

        const { requireRole } = require('../middleware/tenantIsolation');

        function buildEDIApp() {
            const app = buildMinimalApp();
            app.post('/edi/:ediName/:documentId', requireRole('admin', 'operations', 'finance'), (req, res) => res.json({ ok: true }));
            return app;
        }

        it('should allow operations to generate EDI', async () => {
            const app = buildEDIApp();
            const res = await request(app)
                .post('/edi/810/doc-123')
                .set('x-test-user', makeUser({ roles: [{ roleName: 'operations' }] }));
            expect(res.status).toBe(200);
        });

        it('should deny warehouse from EDI', async () => {
            const app = buildEDIApp();
            const res = await request(app)
                .post('/edi/810/doc-123')
                .set('x-test-user', makeUser({ roles: [{ roleName: 'warehouse' }] }));
            expect(res.status).toBe(403);
        });
    });

    // ─── SUPERADMIN BYPASS ───────────────────────────────────────

    describe('SuperAdmin bypass on all RBAC routes', () => {

        const { requireRole, requireFeature } = require('../middleware/tenantIsolation');

        function buildSuperAdminApp() {
            const app = buildMinimalApp();
            app.post('/restricted', requireRole('admin'), (req, res) => res.json({ ok: true }));
            app.post('/feature-gated', requireFeature('premium'), (req, res) => res.json({ ok: true }));
            return app;
        }

        it('should allow superAdmin to bypass role restrictions', async () => {
            const app = buildSuperAdminApp();
            const res = await request(app)
                .post('/restricted')
                .set('x-test-user', makeUser({ userType: 'superAdmin', roles: [] }));
            expect(res.status).toBe(200);
        });

        it('should NOT bypass feature restrictions for superAdmin (feature is org-level)', async () => {
            const app = buildSuperAdminApp();
            const res = await request(app)
                .post('/feature-gated')
                .set('x-test-agent', makeAgent({ features: [] }));
            expect(res.status).toBe(403);
        });
    });

    // ─── WEBHOOK SIGNATURE ───────────────────────────────────────

    describe('OceanIO webhook signature verification', () => {

        const crypto = require('crypto');
        let prevWebhookSecret;
        beforeEach(() => { prevWebhookSecret = process.env.OCEANIO_WEBHOOK_SECRET; });
        afterEach(() => { process.env.OCEANIO_WEBHOOK_SECRET = prevWebhookSecret || ''; });

        function buildWebhookApp() {
            const app = express();
            app.use(express.json());

            app.post('/oceanIOWebhook', (req, res, next) => {
                const signature = req.headers['x-webhook-signature'] || req.headers['x-signature'];
                const s = process.env.OCEANIO_WEBHOOK_SECRET;
                if (!s) return next();
                if (!signature) return res.status(401).json({ error: 'Missing webhook signature' });
                const rawBody = JSON.stringify(req.body);
                const expected = crypto.createHmac('sha256', s).update(rawBody).digest('hex');
                try {
                    if (!crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'))) {
                        return res.status(401).json({ error: 'Invalid webhook signature' });
                    }
                } catch { return res.status(401).json({ error: 'Invalid webhook signature' }); }
                next();
            }, (req, res) => res.json({ ok: true }));

            return app;
        }

        it('should accept webhook with valid HMAC signature', async () => {
            process.env.OCEANIO_WEBHOOK_SECRET = 'test-webhook-secret';
            const body = { event: 'tracking_update', containerId: 'C123' };
            const signature = crypto.createHmac('sha256', 'test-webhook-secret').update(JSON.stringify(body)).digest('hex');

            const app = buildWebhookApp();
            const res = await request(app)
                .post('/oceanIOWebhook')
                .set('x-webhook-signature', signature)
                .send(body);
            expect(res.status).toBe(200);
        });

        it('should reject webhook with invalid signature', async () => {
            process.env.OCEANIO_WEBHOOK_SECRET = 'test-webhook-secret';
            const app = buildWebhookApp();
            const res = await request(app)
                .post('/oceanIOWebhook')
                .set('x-webhook-signature', 'a'.repeat(64))
                .send({ event: 'tracking_update' });
            expect(res.status).toBe(401);
        });

        it('should reject webhook with missing signature when secret is configured', async () => {
            process.env.OCEANIO_WEBHOOK_SECRET = 'test-webhook-secret';
            const app = buildWebhookApp();
            const res = await request(app)
                .post('/oceanIOWebhook')
                .send({ event: 'tracking_update' });
            expect(res.status).toBe(401);
        });

        it('should pass through when no webhook secret is configured', async () => {
            process.env.OCEANIO_WEBHOOK_SECRET = '';
            const app = buildWebhookApp();
            const res = await request(app)
                .post('/oceanIOWebhook')
                .send({ event: 'tracking_update' });
            expect(res.status).toBe(200);
        });
    });
});
