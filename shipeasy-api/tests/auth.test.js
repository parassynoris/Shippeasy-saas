const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

const TEST_JWT_SECRET = 'test-secret-key-for-auth-tests';

describe('Auth Edge Case Tests', () => {

    let prevSecret;
    beforeAll(() => {
        prevSecret = process.env.SECRET_KEY_JWT;
        process.env.SECRET_KEY_JWT = TEST_JWT_SECRET;
    });
    afterAll(() => {
        process.env.SECRET_KEY_JWT = prevSecret || '';
    });

    function buildAuthApp() {
        delete require.cache[require.resolve('../middleware/auth')];
        const { validateAuth } = require('../middleware/auth');
        const app = express();
        app.use(express.json());
        app.get('/protected', validateAuth, (req, res) => {
            res.json({ ok: true, user: res.locals.user?.userLogin || 'unknown' });
        });
        return app;
    }

    // ─── MISSING / MALFORMED TOKEN ───────────────────────────────

    describe('Missing and malformed tokens', () => {

        it('should return 401 when no Authorization header is provided', async () => {
            const app = buildAuthApp();
            const res = await request(app).get('/protected');
            expect(res.status).toBe(401);
            expect(res.body.message).toBe('No token provided');
        });

        it('should return 401 when Authorization header is empty', async () => {
            const app = buildAuthApp();
            const res = await request(app)
                .get('/protected')
                .set('Authorization', '');
            expect(res.status).toBe(401);
            expect(res.body.message).toBe('No token provided');
        });

        it('should return 401 when token is too short (< 10 chars)', async () => {
            const app = buildAuthApp();
            const res = await request(app)
                .get('/protected')
                .set('Authorization', 'Bearer abc');
            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Invalid token format');
        });

        it('should return 401 when Bearer prefix is missing', async () => {
            const app = buildAuthApp();
            const res = await request(app)
                .get('/protected')
                .set('Authorization', 'some-invalid-token-value-here');
            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Authentication failed');
        });

        it('should return 401 for a completely garbage token', async () => {
            const app = buildAuthApp();
            const res = await request(app)
                .get('/protected')
                .set('Authorization', 'Bearer this.is.not.a.valid.jwt.at.all.garbage');
            expect(res.status).toBe(401);
        });
    });

    // ─── EXPIRED JWT ─────────────────────────────────────────────

    describe('Expired JWT tokens', () => {

        it('should return 401 for an expired JWT', async () => {
            const expiredToken = jwt.sign(
                { user: { id: 'u1', username: 'testuser', sessionToken: 1 } },
                TEST_JWT_SECRET,
                { expiresIn: '-1s' }
            );
            const app = buildAuthApp();
            const res = await request(app)
                .get('/protected')
                .set('Authorization', `Bearer ${expiredToken}`);
            expect(res.status).toBe(401);
        });

        it('should return 401 for JWT signed with wrong secret', async () => {
            const wrongSecretToken = jwt.sign(
                { user: { id: 'u1', username: 'testuser', sessionToken: 1 } },
                'completely-wrong-secret',
                { expiresIn: '1h' }
            );
            const app = buildAuthApp();
            const res = await request(app)
                .get('/protected')
                .set('Authorization', `Bearer ${wrongSecretToken}`);
            expect(res.status).toBe(401);
        });

        it('should return 401 for JWT with malformed payload structure', async () => {
            const malformedToken = jwt.sign(
                { data: 'no-user-field' },
                TEST_JWT_SECRET,
                { expiresIn: '1h' }
            );
            const app = buildAuthApp();
            const res = await request(app)
                .get('/protected')
                .set('Authorization', `Bearer ${malformedToken}`);
            expect(res.status).toBe(401);
        });
    });

    // ─── AUTH-EXEMPT ROUTES ──────────────────────────────────────

    describe('Auth-exempt routes', () => {

        function buildAuthAppWithExemptRoutes() {
            delete require.cache[require.resolve('../middleware/auth')];
            const { validateAuth } = require('../middleware/auth');
            const app = express();
            app.use(express.json());
            app.post('/search/faq', validateAuth, (req, res) => res.json({ exempt: true }));
            app.post('/search/country', validateAuth, (req, res) => res.json({ exempt: true }));
            app.post('/search/currency', validateAuth, (req, res) => res.json({ exempt: true }));
            app.post('/search/state', validateAuth, (req, res) => res.json({ exempt: true }));
            app.post('/search/city', validateAuth, (req, res) => res.json({ exempt: true }));
            app.post('/search/batch', validateAuth, (req, res) => res.json({ exempt: false }));
            return app;
        }

        it('should allow POST /search/faq without authentication', async () => {
            const app = buildAuthAppWithExemptRoutes();
            const res = await request(app).post('/search/faq').send({});
            expect(res.status).toBe(200);
            expect(res.body.exempt).toBe(true);
        });

        it('should allow POST /search/country without authentication', async () => {
            const app = buildAuthAppWithExemptRoutes();
            const res = await request(app).post('/search/country').send({});
            expect(res.status).toBe(200);
        });

        it('should allow POST /search/currency without authentication', async () => {
            const app = buildAuthAppWithExemptRoutes();
            const res = await request(app).post('/search/currency').send({});
            expect(res.status).toBe(200);
        });

        it('should allow POST /search/state without authentication', async () => {
            const app = buildAuthAppWithExemptRoutes();
            const res = await request(app).post('/search/state').send({});
            expect(res.status).toBe(200);
        });

        it('should allow POST /search/city without authentication', async () => {
            const app = buildAuthAppWithExemptRoutes();
            const res = await request(app).post('/search/city').send({});
            expect(res.status).toBe(200);
        });

        it('should NOT exempt POST /search/batch', async () => {
            const app = buildAuthAppWithExemptRoutes();
            const res = await request(app).post('/search/batch').send({});
            expect(res.status).toBe(401);
        });

        it('should NOT exempt GET requests to exempt paths (only POST is exempt)', async () => {
            const app = buildAuthAppWithExemptRoutes();
            app.get('/search/faq', require('../middleware/auth').validateAuth, (req, res) => res.json({ ok: true }));
            const res = await request(app).get('/search/faq');
            expect(res.status).toBe(401);
        });
    });

    // ─── INPUT VALIDATION ────────────────────────────────────────

    describe('Login input validation', () => {

        const { validateLogin } = require('../middleware/validateRequest');

        function buildLoginApp() {
            const app = express();
            app.use(express.json());
            app.post('/user/login', ...validateLogin, (req, res) => {
                res.json({ ok: true });
            });
            return app;
        }

        it('should reject login with missing Username', async () => {
            const app = buildLoginApp();
            const res = await request(app).post('/user/login').send({ Password: 'test' });
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Validation failed');
        });

        it('should reject login with missing Password', async () => {
            const app = buildLoginApp();
            const res = await request(app).post('/user/login').send({ Username: 'test' });
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Validation failed');
        });

        it('should reject login with empty body', async () => {
            const app = buildLoginApp();
            const res = await request(app).post('/user/login').send({});
            expect(res.status).toBe(400);
        });

        it('should reject login with Username exceeding max length', async () => {
            const app = buildLoginApp();
            const res = await request(app)
                .post('/user/login')
                .send({ Username: 'a'.repeat(101), Password: 'test' });
            expect(res.status).toBe(400);
        });

        it('should accept login with valid credentials shape', async () => {
            const app = buildLoginApp();
            const res = await request(app)
                .post('/user/login')
                .send({ Username: 'validuser', Password: 'validpassword' });
            expect(res.status).toBe(200);
        });
    });

    describe('Password reset input validation', () => {

        const { validatePasswordReset } = require('../middleware/validateRequest');

        function buildResetApp() {
            const app = express();
            app.use(express.json());
            app.post('/user/reset', ...validatePasswordReset, (req, res) => {
                res.json({ ok: true });
            });
            return app;
        }

        it('should reject reset with invalid email format', async () => {
            const app = buildResetApp();
            const res = await request(app)
                .post('/user/reset')
                .send({ userEmail: 'not-an-email', userLogin: 'testuser' });
            expect(res.status).toBe(400);
        });

        it('should reject reset with missing userLogin', async () => {
            const app = buildResetApp();
            const res = await request(app)
                .post('/user/reset')
                .send({ userEmail: 'test@example.com' });
            expect(res.status).toBe(400);
        });

        it('should accept reset with valid email and userLogin', async () => {
            const app = buildResetApp();
            const res = await request(app)
                .post('/user/reset')
                .send({ userEmail: 'test@example.com', userLogin: 'testuser' });
            expect(res.status).toBe(200);
        });
    });

    describe('CRUD input validation', () => {

        const { validateCrudInsert, validateCrudUpdate, validateSearch } = require('../middleware/validateRequest');

        function buildCrudApp() {
            const app = express();
            app.use(express.json());
            app.post('/search/:indexName', ...validateSearch, (req, res) => res.json({ ok: true }));
            app.post('/:indexName', ...validateCrudInsert, (req, res) => res.json({ ok: true }));
            app.put('/:indexName/:id', ...validateCrudUpdate, (req, res) => res.json({ ok: true }));
            return app;
        }

        it('should reject indexName with special characters', async () => {
            const app = buildCrudApp();
            const res = await request(app).post('/batch$drop').send({});
            expect(res.status).toBe(400);
        });

        it('should reject indexName shorter than 2 characters', async () => {
            const app = buildCrudApp();
            const res = await request(app).post('/a').send({});
            expect(res.status).toBe(400);
        });

        it('should reject indexName longer than 50 characters', async () => {
            const app = buildCrudApp();
            const res = await request(app).post('/' + 'a'.repeat(51)).send({});
            expect(res.status).toBe(400);
        });

        it('should accept valid alphanumeric indexName', async () => {
            const app = buildCrudApp();
            const res = await request(app).post('/batch').send({});
            expect(res.status).toBe(200);
        });

        it('should reject update with id exceeding max length', async () => {
            const app = buildCrudApp();
            const res = await request(app).put('/batch/' + 'x'.repeat(101)).send({});
            expect(res.status).toBe(400);
        });

        it('should accept valid search request', async () => {
            const app = buildCrudApp();
            const res = await request(app).post('/search/enquiry').send({});
            expect(res.status).toBe(200);
        });
    });
});
