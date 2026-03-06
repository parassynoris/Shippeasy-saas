const { body, param, validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array().map(e => ({
                field: e.path,
                message: e.msg,
            })),
        });
    }
    next();
};

const validateLogin = [
    body('Username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ max: 100 }).withMessage('Username too long'),
    body('Password')
        .notEmpty().withMessage('Password is required')
        .isLength({ max: 200 }).withMessage('Password too long'),
    handleValidationErrors,
];

const validatePasswordChange = [
    body('currentPassword')
        .notEmpty().withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
        .matches(/\d/).withMessage('Password must contain a number'),
    handleValidationErrors,
];

const validatePasswordReset = [
    body('userEmail')
        .trim()
        .isEmail().withMessage('Valid email is required'),
    body('userLogin')
        .trim()
        .notEmpty().withMessage('User login is required'),
    handleValidationErrors,
];

const validateCrudInsert = [
    param('indexName')
        .trim()
        .isAlphanumeric().withMessage('Invalid resource name')
        .isLength({ min: 2, max: 50 }).withMessage('Resource name must be 2-50 characters'),
    handleValidationErrors,
];

const validateCrudUpdate = [
    param('indexName')
        .trim()
        .isAlphanumeric().withMessage('Invalid resource name')
        .isLength({ min: 2, max: 50 }).withMessage('Resource name must be 2-50 characters'),
    param('id')
        .trim()
        .notEmpty().withMessage('Document ID is required')
        .isLength({ max: 100 }).withMessage('Document ID too long'),
    handleValidationErrors,
];

const validateSearch = [
    param('indexName')
        .trim()
        .isAlphanumeric().withMessage('Invalid resource name')
        .isLength({ min: 2, max: 50 }).withMessage('Resource name must be 2-50 characters'),
    handleValidationErrors,
];

const validateFileDownload = [
    param('fileName')
        .trim()
        .notEmpty().withMessage('File name is required')
        .custom((value) => {
            if (value.includes('..') || value.includes('/') || value.includes('\\')) {
                throw new AppError('Invalid file name — path traversal detected', 400);
            }
            return true;
        }),
    handleValidationErrors,
];

module.exports = {
    handleValidationErrors,
    validateLogin,
    validatePasswordChange,
    validatePasswordReset,
    validateCrudInsert,
    validateCrudUpdate,
    validateSearch,
    validateFileDownload,
};
