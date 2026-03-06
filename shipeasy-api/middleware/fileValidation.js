/**
 * File upload validation middleware.
 * 
 * Validates uploaded files against allowed MIME types, file extensions,
 * and size limits to prevent malicious file uploads.
 */
const path = require('path');

/**
 * Allowed MIME types for file uploads.
 * Maps MIME types to their expected file extensions.
 */
const ALLOWED_MIME_TYPES = {
    // Documents
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/vnd.ms-powerpoint': ['.ppt'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    'text/csv': ['.csv'],
    'text/plain': ['.txt'],
    'application/xml': ['.xml'],
    'text/xml': ['.xml'],

    // Images
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],
    'image/svg+xml': ['.svg'],
    'image/bmp': ['.bmp'],

    // Archives
    'application/zip': ['.zip'],
    'application/x-rar-compressed': ['.rar'],
    'application/gzip': ['.gz'],

    // Other
    'application/json': ['.json'],
    'message/rfc822': ['.eml'],
};

/**
 * Blocked file extensions that should never be uploaded regardless of MIME type.
 */
const BLOCKED_EXTENSIONS = [
    '.exe', '.bat', '.cmd', '.sh', '.ps1', '.vbs', '.js', '.mjs',
    '.com', '.scr', '.pif', '.msi', '.dll', '.sys', '.drv',
    '.php', '.asp', '.aspx', '.jsp', '.cgi', '.py', '.rb', '.pl',
    '.htaccess', '.htpasswd',
];

/**
 * Default maximum file size: 50MB (in bytes).
 * Can be overridden via MAX_FILE_SIZE environment variable.
 */
const DEFAULT_MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * Middleware to validate uploaded files.
 * Must be placed AFTER multer middleware in the route chain.
 * 
 * @param {Object} options - Configuration options
 * @param {string[]} options.allowedTypes - Array of allowed MIME types (defaults to all ALLOWED_MIME_TYPES)
 * @param {number} options.maxSize - Maximum file size in bytes (defaults to DEFAULT_MAX_FILE_SIZE)
 */
function validateFileUpload(options = {}) {
    const maxSize = options.maxSize || parseInt(process.env.MAX_FILE_SIZE, 10) || DEFAULT_MAX_FILE_SIZE;
    const allowedTypes = options.allowedTypes || Object.keys(ALLOWED_MIME_TYPES);

    return (req, res, next) => {
        const file = req.file;

        // No file uploaded — let the controller handle this case
        if (!file) {
            return next();
        }

        // 1. Check file size
        if (file.size > maxSize) {
            return res.status(413).json({
                error: {
                    code: 'FILE_TOO_LARGE',
                    message: `File size ${(file.size / (1024 * 1024)).toFixed(2)}MB exceeds the maximum allowed size of ${(maxSize / (1024 * 1024)).toFixed(2)}MB`,
                }
            });
        }

        // 2. Check file extension against blocklist
        const ext = path.extname(file.originalname).toLowerCase();
        if (BLOCKED_EXTENSIONS.includes(ext)) {
            return res.status(400).json({
                error: {
                    code: 'FILE_TYPE_BLOCKED',
                    message: `File extension '${ext}' is not allowed for security reasons`,
                }
            });
        }

        // 3. Check MIME type against allowlist
        if (!allowedTypes.includes(file.mimetype)) {
            return res.status(400).json({
                error: {
                    code: 'FILE_TYPE_NOT_ALLOWED',
                    message: `File type '${file.mimetype}' is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
                }
            });
        }

        // 4. Verify extension matches declared MIME type
        const expectedExtensions = ALLOWED_MIME_TYPES[file.mimetype];
        if (expectedExtensions && !expectedExtensions.includes(ext)) {
            console.warn(JSON.stringify({
                traceId: req?.traceId,
                warning: `File extension '${ext}' does not match MIME type '${file.mimetype}'`,
                fileName: file.originalname,
                timestamp: new Date().toISOString()
            }));
            // Allow but log — some systems generate non-standard extensions
        }

        // 5. Sanitize filename to prevent path traversal
        file.originalname = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');

        next();
    };
}

module.exports = {
    validateFileUpload,
    ALLOWED_MIME_TYPES,
    BLOCKED_EXTENSIONS,
};
