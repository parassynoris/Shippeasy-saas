/**
 * Subscription plan enforcement middleware.
 *
 * Checks if the authenticated tenant's subscription plan allows
 * access to the requested resource/feature.
 *
 * Enforcement mode is controlled by PLAN_ENFORCEMENT env var:
 *   - "hard"  → block access with 403 (production)
 *   - "soft"  → log but allow access (rollout/migration, default)
 */

/**
 * Plan definitions — features allowed per plan tier.
 * In production, these would be stored in the database for dynamic management.
 */
const PLAN_FEATURES = {
    free: {
        maxUsers: 3,
        maxDocumentsPerMonth: 100,
        features: ['quotation', 'job', 'batch', 'party'],
    },
    pro: {
        maxUsers: 25,
        maxDocumentsPerMonth: 5000,
        features: ['quotation', 'job', 'batch', 'party', 'edi', 'einvoice', 'loadplan', 'tally', 'report'],
    },
    enterprise: {
        maxUsers: -1, // unlimited
        maxDocumentsPerMonth: -1,
        features: ['*'], // all features
    },
};

/**
 * Collections that are always accessible regardless of plan
 * (reference data, user profile, etc.)
 */
const ALWAYS_ALLOWED = [
    'user', 'role', 'country', 'state', 'city', 'currency', 'uom',
    'faq', 'portlocation', 'exchangerate', 'notification', 'auditlog',
    'agent', 'systemtype',
];

/**
 * Middleware that verifies the tenant's plan allows the requested operation.
 * Must be applied AFTER auth middleware (requires res.locals.user).
 *
 * Enforcement mode:
 *   - PLAN_ENFORCEMENT=hard → returns 403 for disallowed features
 *   - PLAN_ENFORCEMENT=soft → logs but allows (default for backward compatibility)
 */
function checkPlanAccess(req, res, next) {
    const user = res.locals.user;
    const agent = res.locals.agent;

    // If no plan info is available, allow access (backward compatibility)
    if (!agent || !agent.plan) {
        return next();
    }

    const planName = agent.plan || 'free';
    const planConfig = PLAN_FEATURES[planName];

    if (!planConfig) {
        return next(); // Unknown plan, allow access
    }

    // Check if plan allows all features
    if (planConfig.features.includes('*')) {
        return next();
    }

    // For generic CRUD endpoints, check if the collection is within plan features
    const indexName = req.params.indexName;

    // Skip enforcement for always-allowed reference collections
    if (!indexName || ALWAYS_ALLOWED.includes(indexName)) {
        return next();
    }

    if (!planConfig.features.includes(indexName)) {
        const isHardEnforcement = process.env.PLAN_ENFORCEMENT === 'hard';

        console.log(JSON.stringify({
            traceId: req.traceId,
            event: 'PLAN_FEATURE_ACCESS',
            orgId: user?.orgId,
            plan: planName,
            feature: indexName,
            allowed: !isHardEnforcement,
            enforcement: isHardEnforcement ? 'hard' : 'soft',
            timestamp: new Date().toISOString(),
        }));

        if (isHardEnforcement) {
            return res.status(403).json({
                error: {
                    code: 'PLAN_FEATURE_RESTRICTED',
                    message: `The "${indexName}" feature is not available on your current plan (${planName}). Please upgrade to access this feature.`,
                    currentPlan: planName,
                    requiredPlan: getMinimumPlanForFeature(indexName),
                }
            });
        }
    }

    next();
}

/**
 * Determine the minimum plan tier that grants access to a feature.
 */
function getMinimumPlanForFeature(featureName) {
    for (const [planName, config] of Object.entries(PLAN_FEATURES)) {
        if (config.features.includes('*') || config.features.includes(featureName)) {
            return planName;
        }
    }
    return 'enterprise';
}

module.exports = {
    checkPlanAccess,
    PLAN_FEATURES,
    ALWAYS_ALLOWED,
    getMinimumPlanForFeature,
};
