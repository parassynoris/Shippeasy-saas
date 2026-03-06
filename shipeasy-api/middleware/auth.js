const mongoose = require('mongoose');
const Schema = require('../schema/schema');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(process.env.OAUTHCLIENT)

/**
 * Endpoints that bypass authentication for specific request types.
 */
const restrictAuth = ["/search/faq", "/search/country", "/search/currency", "/search/state", "/search/city"]

/**
 * Validate a user and load their profile + org data into res.locals.
 * Extracted from duplicate code in JWT and OAuth paths.
 */
async function loadUserContext(user, res) {
    const agentModel = mongoose.models[`agentModel`] || mongoose.model(`agentModel`, Schema["agent"], `agents`);
    
    res.locals.user = user.toObject();

    const orgData = await agentModel.findOne({ agentId: res.locals.user?.orgId });
    if (orgData) {
        res.locals.agent = orgData.toObject();
    }

    if (!user.userStatus) {
        const message = user.status
            ? 'You need to re-register, please contact support team!'
            : 'You are not allowed to login!';
        return { authorized: false, status: 401, message };
    }

    if (user.isTrial && new Date(user.trialValidTill) < new Date()) {
        return { authorized: false, status: 401, message: 'Your trial has been expired' };
    }

    return { authorized: true };
}

exports.validateAuth = async (req, res, next) => {
    if (req.method === "POST" && restrictAuth.includes(req.url)) {
        return next();
    }
    
    if (!req.headers.authorization) {
        return res.status(401).json({ message: 'No token provided.' });
    }

    let token = "";
    if (req.headers.authorization.startsWith("Bearer"))
        token = req.headers.authorization.split(" ")[1]
    else
        token = req.headers.authorization;

    // Try JWT verification first
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY_JWT);
        const userModel = mongoose.models.userModel || mongoose.model('userModel', Schema["user"], 'users');

        const user = await userModel.findOne({
            'userLogin': decoded.user.username,
            tokenVersion: decoded.user.sessionToken
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const result = await loadUserContext(user, res);
        if (!result.authorized) {
            return res.status(result.status).json({ message: result.message });
        }

        return next();
    } catch (jwtError) {
        // JWT failed — try Google OAuth as fallback
        try {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.OAUTHCLIENT
            });

            const { email } = ticket.getPayload();
            const userModel = mongoose.models.userModel || mongoose.model('userModel', Schema["user"], 'users');

            const user = await userModel.findOne({ 'userEmail': email });

            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const result = await loadUserContext(user, res);
            if (!result.authorized) {
                return res.status(result.status).json({ message: result.message });
            }

            return next();
        } catch (oauthError) {
            return res.status(401).json({ message: oauthError?.message || 'Authentication failed' });
        }
    }
}