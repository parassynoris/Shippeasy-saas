const logger = require('../utils/logger');

const TENANT_EXEMPT_COLLECTIONS = new Set([
    'country', 'state', 'city', 'port', 'currency', 'commodity',
    'airportmaster',
]);

const enforceTenantIsolation = (req, res, next) => {
    const user = res.locals.user;
    const agent = res.locals.agent;

    if (!user || !agent) {
        return next();
    }

    const orgId = agent.agentId || user.orgId;
    if (!orgId) {
        logger.warn('Request without orgId detected', {
            traceId: req.traceId,
            userId: user.userId,
            path: req.path,
        });
        return next();
    }

    req.orgId = orgId;
    req.tenantContext = {
        orgId,
        userId: user.userId,
        userType: user.userType,
        isSuperAdmin: user.userType === 'superAdmin',
    };

    if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
        const indexName = req.params.indexName;

        if (indexName && TENANT_EXEMPT_COLLECTIONS.has(indexName)) {
            return next();
        }

        if (req.body.query && typeof req.body.query === 'object') {
            if (!req.tenantContext.isSuperAdmin) {
                req.body.query.orgId = orgId;
            }
        }

        if (req.method === 'POST' && !req.body.query) {
            if (indexName && !req.path.includes('/search/')) {
                req.body.orgId = req.body.orgId || orgId;
            }
        }
    }

    next();
};

const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        const user = res.locals.user;
        if (!user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const userRoles = user.roles?.map(r => r.roleName?.toLowerCase()) || [];
        const hasRole = allowedRoles.some(role => userRoles.includes(role.toLowerCase()));

        if (!hasRole && user.userType !== 'superAdmin') {
            logger.warn('Insufficient permissions', {
                traceId: req.traceId,
                userId: user.userId,
                required: allowedRoles,
                actual: userRoles,
                path: req.path,
            });
            return res.status(403).json({ error: 'Insufficient permissions' });
        }

        next();
    };
};

const requireFeature = (featureSlug) => {
    return (req, res, next) => {
        const agent = res.locals.agent;
        if (!agent) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const features = agent.features || [];
        const hasFeature = features.some(f => f.slug === featureSlug && f.isActive);

        if (!hasFeature) {
            return res.status(403).json({ error: 'Feature not available for your plan' });
        }

        next();
    };
};

module.exports = {
    enforceTenantIsolation,
    requireRole,
    requireFeature,
    TENANT_EXEMPT_COLLECTIONS,
};
