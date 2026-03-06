/**
 * Subscription plan enforcement middleware.
 *
 * Checks if the authenticated tenant's subscription plan allows
 * access to the requested resource/feature. This middleware lays
 * the foundation for plan-based feature gating in the SaaS platform.
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
 * Middleware that verifies the tenant's plan allows the requested operation.
 * Must be applied AFTER auth middleware (requires res.locals.user).
 *
 * For now, this is a lightweight check that logs plan status.
 * Full enforcement requires integration with a billing provider (Stripe/Razorpay).
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
    if (indexName && !planConfig.features.includes(indexName)) {
        // Log but don't block (soft enforcement during rollout)
        console.log(JSON.stringify({
            traceId: req.traceId,
            event: 'PLAN_FEATURE_ACCESS',
            orgId: user?.orgId,
            plan: planName,
            feature: indexName,
            allowed: false,
        }));
    }

    next();
}

module.exports = {
    checkPlanAccess,
    PLAN_FEATURES,
};
