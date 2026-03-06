const { body, validationResult } = require('express-validator');

/**
 * Centralized validation error handler.
 * Returns 400 with standardized error format if validation fails.
 */
function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Input validation failed',
                details: errors.array().map(e => ({
                    field: e.path,
                    message: e.msg,
                })),
            },
        });
    }
    next();
}

/**
 * Validation rules for POST /api/user/login
 */
const loginValidation = [
    body('Username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ max: 100 }).withMessage('Username must not exceed 100 characters'),
    body('Password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 1, max: 128 }).withMessage('Password must be between 1 and 128 characters'),
    handleValidationErrors,
];

/**
 * Validation rules for POST /api/user/reset
 */
const resetValidation = [
    body('userEmail')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Must be a valid email address')
        .normalizeEmail(),
    body('userLogin')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ max: 100 }).withMessage('Username must not exceed 100 characters'),
    handleValidationErrors,
];

/**
 * Validation rules for POST /api/user/change-password
 */
const changePasswordValidation = [
    body('userEmail')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Must be a valid email address')
        .normalizeEmail(),
    body('userLogin')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ max: 100 }).withMessage('Username must not exceed 100 characters'),
    body('currentPassword')
        .notEmpty().withMessage('Current password is required'),
    body('newPassword')
        .notEmpty().withMessage('New password is required')
        .isLength({ min: 8, max: 128 }).withMessage('New password must be between 8 and 128 characters'),
    handleValidationErrors,
];

/**
 * Validation rules for POST /api/agentOnBoarding
 */
const agentOnboardingValidation = [
    body('firstName')
        .trim()
        .notEmpty().withMessage('First name is required')
        .isLength({ max: 100 }).withMessage('First name must not exceed 100 characters'),
    body('lastName')
        .trim()
        .notEmpty().withMessage('Last name is required')
        .isLength({ max: 100 }).withMessage('Last name must not exceed 100 characters'),
    body('email')
        .optional()
        .trim()
        .isEmail().withMessage('Must be a valid email address')
        .normalizeEmail(),
    handleValidationErrors,
];

module.exports = {
    handleValidationErrors,
    loginValidation,
    resetValidation,
    changePasswordValidation,
    agentOnboardingValidation,
};
