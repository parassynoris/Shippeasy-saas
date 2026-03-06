/**
 * Unit tests for file upload validation middleware
 */
const { validateFileUpload, ALLOWED_MIME_TYPES, BLOCKED_EXTENSIONS } = require('../middleware/fileValidation');

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

describe('File Upload Validation', () => {
    describe('ALLOWED_MIME_TYPES', () => {
        it('should allow common document types', () => {
            const mimeTypes = Object.keys(ALLOWED_MIME_TYPES);
            expect(mimeTypes).toContain('application/pdf');
            expect(mimeTypes).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        });

        it('should allow common image types', () => {
            const mimeTypes = Object.keys(ALLOWED_MIME_TYPES);
            expect(mimeTypes).toContain('image/jpeg');
            expect(mimeTypes).toContain('image/png');
        });
    });

    describe('BLOCKED_EXTENSIONS', () => {
        it('should block executable files', () => {
            expect(BLOCKED_EXTENSIONS).toContain('.exe');
            expect(BLOCKED_EXTENSIONS).toContain('.bat');
            expect(BLOCKED_EXTENSIONS).toContain('.cmd');
        });

        it('should block script files', () => {
            expect(BLOCKED_EXTENSIONS).toContain('.js');
            expect(BLOCKED_EXTENSIONS).toContain('.sh');
            expect(BLOCKED_EXTENSIONS).toContain('.php');
            expect(BLOCKED_EXTENSIONS).toContain('.py');
        });
    });

    describe('validateFileUpload middleware', () => {
        it('should call next() when no file is uploaded', () => {
            const middleware = validateFileUpload();
            const req = {};
            const res = mockRes();
            const next = jest.fn();

            middleware(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('should allow a valid PDF upload', () => {
            const middleware = validateFileUpload();
            const req = {
                file: {
                    originalname: 'document.pdf',
                    mimetype: 'application/pdf',
                    size: 1024 * 100, // 100KB
                }
            };
            const res = mockRes();
            const next = jest.fn();

            middleware(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('should allow a valid JPEG image', () => {
            const middleware = validateFileUpload();
            const req = {
                file: {
                    originalname: 'photo.jpg',
                    mimetype: 'image/jpeg',
                    size: 1024 * 500, // 500KB
                }
            };
            const res = mockRes();
            const next = jest.fn();

            middleware(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('should reject executable files', () => {
            const middleware = validateFileUpload();
            const req = {
                file: {
                    originalname: 'malware.exe',
                    mimetype: 'application/octet-stream',
                    size: 1024,
                }
            };
            const res = mockRes();
            const next = jest.fn();

            middleware(req, res, next);
            expect(next).not.toHaveBeenCalled();
            expect(res.statusCode).toBe(400);
            expect(res.body.error.code).toBe('FILE_TYPE_BLOCKED');
        });

        it('should reject script files (.js)', () => {
            const middleware = validateFileUpload();
            const req = {
                file: {
                    originalname: 'script.js',
                    mimetype: 'text/javascript',
                    size: 1024,
                }
            };
            const res = mockRes();
            const next = jest.fn();

            middleware(req, res, next);
            expect(next).not.toHaveBeenCalled();
            expect(res.statusCode).toBe(400);
        });

        it('should reject files that are too large', () => {
            const middleware = validateFileUpload({ maxSize: 1024 }); // 1KB limit
            const req = {
                file: {
                    originalname: 'big.pdf',
                    mimetype: 'application/pdf',
                    size: 1024 * 1024, // 1MB
                }
            };
            const res = mockRes();
            const next = jest.fn();

            middleware(req, res, next);
            expect(next).not.toHaveBeenCalled();
            expect(res.statusCode).toBe(413);
            expect(res.body.error.code).toBe('FILE_TOO_LARGE');
        });

        it('should reject disallowed MIME types', () => {
            const middleware = validateFileUpload();
            const req = {
                file: {
                    originalname: 'file.html',
                    mimetype: 'text/html',
                    size: 1024,
                }
            };
            const res = mockRes();
            const next = jest.fn();

            middleware(req, res, next);
            expect(next).not.toHaveBeenCalled();
            expect(res.statusCode).toBe(400);
            expect(res.body.error.code).toBe('FILE_TYPE_NOT_ALLOWED');
        });

        it('should sanitize filenames with path traversal attempts', () => {
            const middleware = validateFileUpload();
            const req = {
                file: {
                    originalname: '../../../etc/passwd.pdf',
                    mimetype: 'application/pdf',
                    size: 1024,
                }
            };
            const res = mockRes();
            const next = jest.fn();

            middleware(req, res, next);
            expect(next).toHaveBeenCalled();
            // Filename should be sanitized
            expect(req.file.originalname).not.toContain('..');
            expect(req.file.originalname).not.toContain('/');
        });
    });
});
