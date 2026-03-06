const express = require('express');
const router = express.Router();

const { validateAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/security');
const { validateLogin, validatePasswordReset } = require('../middleware/validateRequest');
const { agentOnBoarding, getToken, resetUser, authProfile, changePassword } = require('../controller/auth.controller');

router.post('/user/login', authLimiter, validateLogin, getToken);
router.post('/user/reset', authLimiter, validatePasswordReset, resetUser);
router.post('/user/change-password', authLimiter, validateAuth, changePassword);
router.post('/auth', [validateAuth, authProfile]);
router.post('/agentOnBoarding', [agentOnBoarding]);

module.exports = router;
