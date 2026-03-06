/**
 * Unit tests for input validation middleware
 * Tests the express-validator chains exported from validation.js
 */
const { loginValidation, resetValidation, changePasswordValidation, agentOnboardingValidation } = require('../middleware/validation');

/**
 * Helper to run an express-validator middleware chain against a request body.
 * Each express-validator middleware returns a promise that resolves when done.
 * The final middleware (handleValidationErrors) is synchronous.
 */
async function runValidation(validationChain, body) {
    const req = { body: { ...body }, method: 'POST', headers: {}, query: {}, params: {} };
    let responseStatusCode = null;
    let responseBody = null;
    let nextCalled = false;

    const res = {
        status(code) { responseStatusCode = code; return res; },
        json(data) { responseBody = data; return res; },
    };
    const next = () => { nextCalled = true; };

    // express-validator body() middlewares return a Runner (thenable)
    // The last item in the chain is handleValidationErrors (sync function)
    for (const middleware of validationChain) {
        if (responseStatusCode !== null) break; // Stop if response already sent

        const result = middleware(req, res, next);
        // express-validator middleware returns a promise-like
        if (result && typeof result.then === 'function') {
            await result;
        }
    }

    return { req, statusCode: responseStatusCode || 200, body: responseBody, nextCalled };
}

describe('Input Validation', () => {
    describe('loginValidation', () => {
        it('should pass with valid credentials', async () => {
            const { nextCalled, statusCode } = await runValidation(loginValidation, {
                Username: 'testuser',
                Password: 'password123',
            });
            expect(nextCalled).toBe(true);
            expect(statusCode).toBe(200);
        });

        it('should fail when Username is missing', async () => {
            const { statusCode, body } = await runValidation(loginValidation, {
                Password: 'password123',
            });
            expect(statusCode).toBe(400);
            expect(body.error.code).toBe('VALIDATION_ERROR');
        });

        it('should fail when Password is missing', async () => {
            const { statusCode } = await runValidation(loginValidation, {
                Username: 'testuser',
            });
            expect(statusCode).toBe(400);
        });

        it('should fail when Username is empty', async () => {
            const { statusCode } = await runValidation(loginValidation, {
                Username: '',
                Password: 'password123',
            });
            expect(statusCode).toBe(400);
        });
    });

    describe('resetValidation', () => {
        it('should pass with valid email and username', async () => {
            const { nextCalled } = await runValidation(resetValidation, {
                userEmail: 'test@example.com',
                userLogin: 'testuser',
            });
            expect(nextCalled).toBe(true);
        });

        it('should fail with invalid email', async () => {
            const { statusCode } = await runValidation(resetValidation, {
                userEmail: 'not-an-email',
                userLogin: 'testuser',
            });
            expect(statusCode).toBe(400);
        });

        it('should fail when username is missing', async () => {
            const { statusCode } = await runValidation(resetValidation, {
                userEmail: 'test@example.com',
            });
            expect(statusCode).toBe(400);
        });
    });

    describe('changePasswordValidation', () => {
        it('should pass with valid data', async () => {
            const { nextCalled } = await runValidation(changePasswordValidation, {
                userEmail: 'test@example.com',
                userLogin: 'testuser',
                currentPassword: 'oldpass12',
                newPassword: 'newpass123',
            });
            expect(nextCalled).toBe(true);
        });

        it('should fail when new password is too short', async () => {
            const { statusCode } = await runValidation(changePasswordValidation, {
                userEmail: 'test@example.com',
                userLogin: 'testuser',
                currentPassword: 'oldpass12',
                newPassword: 'short',
            });
            expect(statusCode).toBe(400);
        });
    });

    describe('agentOnboardingValidation', () => {
        it('should pass with valid data', async () => {
            const { nextCalled } = await runValidation(agentOnboardingValidation, {
                firstName: 'John',
                lastName: 'Doe',
            });
            expect(nextCalled).toBe(true);
        });

        it('should fail when firstName is missing', async () => {
            const { statusCode } = await runValidation(agentOnboardingValidation, {
                lastName: 'Doe',
            });
            expect(statusCode).toBe(400);
        });
    });
});
