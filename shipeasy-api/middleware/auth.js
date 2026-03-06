const mongoose = require('mongoose');
const Schema = require('../schema/schema');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const logger = require('../utils/logger');

const client = new OAuth2Client(process.env.OAUTHCLIENT);

const AUTH_EXEMPT_ROUTES = [
    '/search/faq',
    '/search/country',
    '/search/currency',
    '/search/state',
    '/search/city',
];

async function resolveUserContext(user, res) {
    res.locals.user = user.toObject();

    const agentModel = mongoose.models['agentModel']
        || mongoose.model('agentModel', Schema['agent'], 'agents');

    const orgData = await agentModel.findOne({ agentId: res.locals.user?.orgId });
    if (orgData) {
        res.locals.agent = orgData.toObject();
    }
}

function checkUserStatus(user, res) {
    if (!user.userStatus) {
        const message = user.status
            ? 'You need to re-register, please contact support team!'
            : 'You are not allowed to login!';
        res.status(401).json({ message });
        return false;
    }

    if (user.isTrial && new Date(user.trialValidTill) < new Date()) {
        res.status(401).json({ message: 'Your trial has been expired' });
        return false;
    }

    return true;
}

async function authenticateWithJWT(token, req, res, next) {
    const decoded = jwt.verify(token, process.env.SECRET_KEY_JWT);

    const userModel = mongoose.models.userModel
        || mongoose.model('userModel', Schema['user'], 'users');

    const user = await userModel.findOne({
        userLogin: decoded.user.username,
        tokenVersion: decoded.user.sessionToken,
    });

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    await resolveUserContext(user, res);

    if (checkUserStatus(user, res)) {
        next();
    }
}

async function authenticateWithGoogle(token, req, res, next) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.OAUTHCLIENT,
    });

    const { email } = ticket.getPayload();

    const userModel = mongoose.models.userModel
        || mongoose.model('userModel', Schema['user'], 'users');

    const user = await userModel.findOne({ userEmail: email });

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    await resolveUserContext(user, res);

    if (checkUserStatus(user, res)) {
        next();
    }
}

exports.validateAuth = async (req, res, next) => {
    if (req.method === 'POST' && AUTH_EXEMPT_ROUTES.includes(req.url)) {
        return next();
    }

    const expectedApiKey = process.env.X_API_KEY;
    if (expectedApiKey) {
        const clientApiKey = req.headers['x-api-key'];
        if (!clientApiKey || clientApiKey !== expectedApiKey) {
            return res.status(403).json({ message: 'Invalid or missing API key' });
        }
    }

    if (!req.headers.authorization) {
        return res.status(401).json({ message: 'No token provided' });
    }

    let token = req.headers.authorization;
    if (token.startsWith('Bearer ')) {
        token = token.slice(7);
    }

    if (!token || token.length < 10) {
        return res.status(401).json({ message: 'Invalid token format' });
    }

    try {
        await authenticateWithJWT(token, req, res, next);
    } catch (jwtError) {
        try {
            await authenticateWithGoogle(token, req, res, next);
        } catch (googleError) {
            logger.warn('Authentication failed', {
                traceId: req.traceId,
                ip: req.ip,
                path: req.path,
                error: googleError.message,
            });
            return res.status(401).json({ message: 'Authentication failed' });
        }
    }
};
