const request = require('supertest');
const express = require('express');

describe('Security Middleware Tests', () => {

    // ─── CORS LOCKDOWN (CRIT-03) ─────────────────────────────────

    describe('CORS configuration', () => {

        function buildAppWithCorsOrigins(origins) {
            const prev = process.env.CORS_ORIGINS;
            process.env.CORS_ORIGINS = origins;

            delete require.cache[require.resolve('../middleware/security')];
            const { corsConfig, helmetMiddleware } = require('../middleware/security');
            const cors = require('cors');

            const app = express();
            app.use(helmetMiddleware);
            app.use(cors(corsConfig()));
            app.get('/test', (req, res) => res.json({ ok: true }));

            process.env.CORS_ORIGINS = prev !== undefined ? prev : '';
            delete require.cache[require.resolve('../middleware/security')];

            return app;
        }

        it('should reject browser requests when CORS_ORIGINS is empty', async () => {
            const app = buildAppWithCorsOrigins('');
            const res = await request(app)
                .get('/test')
                .set('Origin', 'https://evil.com');

            expect(res.status).toBe(500);
        });

        it('should allow requests from configured origins', async () => {
            const app = buildAppWithCorsOrigins('https://app.shippeasy.com,https://admin.shippeasy.com');
            const res = await request(app)
                .get('/test')
                .set('Origin', 'https://app.shippeasy.com');

            expect(res.status).toBe(200);
            expect(res.headers['access-control-allow-origin']).toBe('https://app.shippeasy.com');
        });

        it('should reject requests from non-configured origins', async () => {
            const app = buildAppWithCorsOrigins('https://app.shippeasy.com');
            const res = await request(app)
                .get('/test')
                .set('Origin', 'https://evil.com');

            expect(res.status).toBe(500);
        });

        it('should allow server-to-server requests (no Origin header)', async () => {
            const app = buildAppWithCorsOrigins('https://app.shippeasy.com');
            const res = await request(app).get('/test');

            expect(res.status).toBe(200);
        });
    });

    // ─── RBAC MIDDLEWARE (CRIT-02) ────────────────────────────────

    describe('requireRole middleware', () => {

        const { requireRole, requireFeature } = require('../middleware/tenantIsolation');

        function buildRbacApp() {
            const app = express();
            app.use(express.json());

            app.get('/admin-only',
                (req, res, next) => {
                    res.locals.user = req.headers['x-test-user']
                        ? JSON.parse(req.headers['x-test-user'])
                        : null;
                    next();
                },
                requireRole('admin'),
                (req, res) => res.json({ ok: true })
            );

            app.get('/finance-only',
                (req, res, next) => {
                    res.locals.user = req.headers['x-test-user']
                        ? JSON.parse(req.headers['x-test-user'])
                        : null;
                    next();
                },
                requireRole('admin', 'finance'),
                (req, res) => res.json({ ok: true })
            );

            app.get('/feature-gated',
                (req, res, next) => {
                    res.locals.user = req.headers['x-test-user']
                        ? JSON.parse(req.headers['x-test-user'])
                        : null;
                    res.locals.agent = req.headers['x-test-agent']
                        ? JSON.parse(req.headers['x-test-agent'])
                        : null;
                    next();
                },
                requireFeature('ai-scanning'),
                (req, res) => res.json({ ok: true })
            );

            return app;
        }

        it('should return 401 when no user is authenticated', async () => {
            const app = buildRbacApp();
            const res = await request(app).get('/admin-only');
            expect(res.status).toBe(401);
            expect(res.body.error).toBe('Authentication required');
        });

        it('should return 403 when user lacks required role', async () => {
            const app = buildRbacApp();
            const user = { userId: 'u1', userType: 'agent', roles: [{ roleName: 'viewer' }] };
            const res = await request(app)
                .get('/admin-only')
                .set('x-test-user', JSON.stringify(user));

            expect(res.status).toBe(403);
            expect(res.body.error).toBe('Insufficient permissions');
        });

        it('should allow user with matching role', async () => {
            const app = buildRbacApp();
            const user = { userId: 'u1', userType: 'agent', roles: [{ roleName: 'admin' }] };
            const res = await request(app)
                .get('/admin-only')
                .set('x-test-user', JSON.stringify(user));

            expect(res.status).toBe(200);
        });

        it('should allow superAdmin regardless of roles', async () => {
            const app = buildRbacApp();
            const user = { userId: 'u1', userType: 'superAdmin', roles: [] };
            const res = await request(app)
                .get('/admin-only')
                .set('x-test-user', JSON.stringify(user));

            expect(res.status).toBe(200);
        });

        it('should allow any of multiple permitted roles', async () => {
            const app = buildRbacApp();
            const user = { userId: 'u1', userType: 'agent', roles: [{ roleName: 'Finance' }] };
            const res = await request(app)
                .get('/finance-only')
                .set('x-test-user', JSON.stringify(user));

            expect(res.status).toBe(200);
        });

        it('should be case-insensitive for role matching', async () => {
            const app = buildRbacApp();
            const user = { userId: 'u1', userType: 'agent', roles: [{ roleName: 'ADMIN' }] };
            const res = await request(app)
                .get('/admin-only')
                .set('x-test-user', JSON.stringify(user));

            expect(res.status).toBe(200);
        });
    });

    describe('requireFeature middleware', () => {

        const { requireFeature } = require('../middleware/tenantIsolation');

        function buildFeatureApp() {
            const app = express();
            app.use(express.json());

            app.get('/feature-gated',
                (req, res, next) => {
                    res.locals.user = req.headers['x-test-user']
                        ? JSON.parse(req.headers['x-test-user'])
                        : null;
                    res.locals.agent = req.headers['x-test-agent']
                        ? JSON.parse(req.headers['x-test-agent'])
                        : null;
                    next();
                },
                requireFeature('ai-scanning'),
                (req, res) => res.json({ ok: true })
            );

            return app;
        }

        it('should return 401 when no agent context exists', async () => {
            const app = buildFeatureApp();
            const res = await request(app).get('/feature-gated');

            expect(res.status).toBe(401);
        });

        it('should return 403 when feature is not enabled for org', async () => {
            const app = buildFeatureApp();
            const agent = { agentId: 'org1', features: [{ slug: 'einvoicing', isActive: true }] };
            const res = await request(app)
                .get('/feature-gated')
                .set('x-test-agent', JSON.stringify(agent));

            expect(res.status).toBe(403);
            expect(res.body.error).toBe('Feature not available for your plan');
        });

        it('should allow when feature is active for the org', async () => {
            const app = buildFeatureApp();
            const agent = { agentId: 'org1', features: [{ slug: 'ai-scanning', isActive: true }] };
            const res = await request(app)
                .get('/feature-gated')
                .set('x-test-agent', JSON.stringify(agent));

            expect(res.status).toBe(200);
        });

        it('should reject when feature exists but is inactive', async () => {
            const app = buildFeatureApp();
            const agent = { agentId: 'org1', features: [{ slug: 'ai-scanning', isActive: false }] };
            const res = await request(app)
                .get('/feature-gated')
                .set('x-test-agent', JSON.stringify(agent));

            expect(res.status).toBe(403);
        });
    });

    // ─── TENANT ISOLATION ────────────────────────────────────────

    describe('Tenant isolation middleware', () => {

        const { enforceTenantIsolation, TENANT_EXEMPT_COLLECTIONS } = require('../middleware/tenantIsolation');

        function buildTenantApp() {
            const app = express();
            app.use(express.json());

            app.post('/api/search/:indexName',
                (req, res, next) => {
                    res.locals.user = req.headers['x-test-user']
                        ? JSON.parse(req.headers['x-test-user'])
                        : null;
                    res.locals.agent = req.headers['x-test-agent']
                        ? JSON.parse(req.headers['x-test-agent'])
                        : null;
                    next();
                },
                enforceTenantIsolation,
                (req, res) => res.json({
                    injectedOrgId: req.body?.query?.orgId,
                    tenantContext: req.tenantContext,
                })
            );

            app.post('/api/:indexName',
                (req, res, next) => {
                    res.locals.user = req.headers['x-test-user']
                        ? JSON.parse(req.headers['x-test-user'])
                        : null;
                    res.locals.agent = req.headers['x-test-agent']
                        ? JSON.parse(req.headers['x-test-agent'])
                        : null;
                    next();
                },
                enforceTenantIsolation,
                (req, res) => res.json({
                    bodyOrgId: req.body?.orgId,
                    tenantContext: req.tenantContext,
                })
            );

            return app;
        }

        it('should inject orgId into search queries for normal users', async () => {
            const app = buildTenantApp();
            const user = { userId: 'u1', orgId: 'org123', userType: 'agent' };
            const agent = { agentId: 'org123' };

            const res = await request(app)
                .post('/api/search/batch')
                .set('x-test-user', JSON.stringify(user))
                .set('x-test-agent', JSON.stringify(agent))
                .send({ query: { statusOfBatch: 'active' } });

            expect(res.status).toBe(200);
            expect(res.body.injectedOrgId).toBe('org123');
        });

        it('should NOT inject orgId for superAdmin searches', async () => {
            const app = buildTenantApp();
            const user = { userId: 'u1', orgId: 'org123', userType: 'superAdmin' };
            const agent = { agentId: 'org123' };

            const res = await request(app)
                .post('/api/search/batch')
                .set('x-test-user', JSON.stringify(user))
                .set('x-test-agent', JSON.stringify(agent))
                .send({ query: { statusOfBatch: 'active' } });

            expect(res.status).toBe(200);
            expect(res.body.injectedOrgId).toBeUndefined();
        });

        it('should skip tenant isolation for exempt collections', async () => {
            const app = buildTenantApp();
            const user = { userId: 'u1', orgId: 'org123', userType: 'agent' };
            const agent = { agentId: 'org123' };

            const res = await request(app)
                .post('/api/search/country')
                .set('x-test-user', JSON.stringify(user))
                .set('x-test-agent', JSON.stringify(agent))
                .send({ query: {} });

            expect(res.status).toBe(200);
            expect(res.body.injectedOrgId).toBeUndefined();
        });

        it('should inject orgId into insert bodies', async () => {
            const app = buildTenantApp();
            const user = { userId: 'u1', orgId: 'org123', userType: 'agent' };
            const agent = { agentId: 'org123' };

            const res = await request(app)
                .post('/api/batch')
                .set('x-test-user', JSON.stringify(user))
                .set('x-test-agent', JSON.stringify(agent))
                .send({ batchName: 'Test Batch' });

            expect(res.status).toBe(200);
            expect(res.body.bodyOrgId).toBe('org123');
        });

        it('should define correct exempt collections set', () => {
            expect(TENANT_EXEMPT_COLLECTIONS.has('country')).toBe(true);
            expect(TENANT_EXEMPT_COLLECTIONS.has('port')).toBe(true);
            expect(TENANT_EXEMPT_COLLECTIONS.has('currency')).toBe(true);
            expect(TENANT_EXEMPT_COLLECTIONS.has('batch')).toBe(false);
            expect(TENANT_EXEMPT_COLLECTIONS.has('invoice')).toBe(false);
        });
    });

    // ─── ENVIRONMENT SECRETS (CRIT-01) ───────────────────────────

    describe('Frontend environment files — no hardcoded secrets', () => {

        const fs = require('fs');
        const path = require('path');

        const envDir = path.resolve(__dirname, '../../shipeasy/src/environments');
        const envFiles = [
            'environment.ts',
            'environment.prod.ts',
            'environment.dev.ts',
            'environment.demo.ts',
            'environment.indianproduction.ts',
        ];

        const secretPatterns = [
            /password\s*[:=]\s*["'][^#][^"']+["']/i,
            /username\s*[:=]\s*["'][^#][^"']+["']/i,
            /secretkey\s*[:=]\s*["'](?!#\{)[A-Za-z0-9]{10,}["']/i,
            /['"]x-api-key['"]\s*[:=]\s*["'](?!#\{)[A-Za-z0-9]{10,}["']/i,
        ];

        envFiles.forEach(file => {
            it(`${file} should not contain hardcoded secrets`, () => {
                const filePath = path.join(envDir, file);
                if (!fs.existsSync(filePath)) {
                    return;
                }
                const content = fs.readFileSync(filePath, 'utf-8');

                secretPatterns.forEach(pattern => {
                    expect(content).not.toMatch(pattern);
                });
            });

            it(`${file} should not contain plain-text user credentials`, () => {
                const filePath = path.join(envDir, file);
                if (!fs.existsSync(filePath)) {
                    return;
                }
                const content = fs.readFileSync(filePath, 'utf-8');

                expect(content).not.toContain('vikash.subudhi');
                expect(content).not.toContain('Tead@1');
                expect(content).not.toContain('amich');
                expect(content).not.toContain('test1234');
            });
        });
    });

    // ─── ERROR HANDLER ───────────────────────────────────────────

    describe('Error handling', () => {

        const { AppError, notFoundHandler, globalErrorHandler } = require('../middleware/errorHandler');

        function buildErrorApp() {
            const app = express();

            app.get('/trigger-error', (req, res, next) => {
                next(new AppError('Test operational error', 422));
            });

            app.get('/trigger-crash', (req, res, next) => {
                next(new Error('unexpected failure'));
            });

            app.use(notFoundHandler);
            app.use(globalErrorHandler);

            return app;
        }

        it('should return 404 for undefined routes', async () => {
            const app = buildErrorApp();
            const res = await request(app).get('/nonexistent-route');

            expect(res.status).toBe(404);
            expect(res.body.error).toContain('Route not found');
        });

        it('should return operational errors with their status code', async () => {
            const app = buildErrorApp();
            const res = await request(app).get('/trigger-error');

            expect(res.status).toBe(422);
            expect(res.body.error).toBe('Test operational error');
        });

        it('should hide internal error details from clients', async () => {
            const app = buildErrorApp();
            const prev = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';

            const res = await request(app).get('/trigger-crash');

            process.env.NODE_ENV = prev;
            expect(res.status).toBe(500);
            expect(res.body.error).toBe('Internal server error');
            expect(res.body.stack).toBeUndefined();
        });
    });

    // ─── INPUT VALIDATION ────────────────────────────────────────

    describe('Input validation middleware', () => {

        const { validateFileDownload } = require('../middleware/validateRequest');
        const { validationResult } = require('express-validator');

        function buildValidationApp() {
            const app = express();
            app.use(express.json());

            app.post('/downloadfile/:fileName',
                validateFileDownload,
                (req, res) => {
                    const errors = validationResult(req);
                    if (!errors.isEmpty()) {
                        return res.status(400).json({ errors: errors.array() });
                    }
                    res.json({ ok: true });
                }
            );

            return app;
        }

        it('should reject path traversal in file download', async () => {
            const app = buildValidationApp();
            const res = await request(app)
                .post('/downloadfile/..%2F..%2Fetc%2Fpasswd');

            expect(res.status).toBe(400);
        });

        it('should reject filenames with forward slashes', async () => {
            const app = buildValidationApp();
            const res = await request(app)
                .post('/downloadfile/path/to/secret');

            expect([400, 404]).toContain(res.status);
        });

        it('should accept valid filenames', async () => {
            const app = buildValidationApp();
            const res = await request(app)
                .post('/downloadfile/report-2024.pdf');

            expect(res.status).toBe(200);
        });
    });
});
