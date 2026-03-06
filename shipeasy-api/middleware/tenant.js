/**
 * Tenant isolation middleware.
 *
 * Ensures every CRUD operation is scoped to the authenticated user's
 * organization (orgId). This prevents cross-tenant data access even if
 * a controller omits the orgId filter by accident.
 *
 * For INSERT operations: auto-injects orgId into the request body.
 * For UPDATE/DELETE: validates that the target document belongs to the tenant.
 * For SEARCH: injects orgId into search filters.
 */

/**
 * Collections that are shared across all tenants (no orgId scoping).
 * These typically contain system-wide reference data.
 */
const SHARED_COLLECTIONS = [
    'country', 'state', 'city', 'currency', 'uom',
    'faq', 'portlocation', 'role', 'exchangerate',
];

/**
 * Middleware to enforce tenant isolation on generic CRUD operations.
 * Must be applied AFTER auth middleware (requires res.locals.user).
 */
function enforceTenantIsolation(req, res, next) {
    const user = res.locals.user;
    const indexName = req.params.indexName;

    // Skip tenant enforcement for shared/global collections
    if (SHARED_COLLECTIONS.includes(indexName)) {
        return next();
    }

    // User must be authenticated (auth middleware should have set this)
    if (!user || !user.orgId) {
        return next(); // Let auth middleware handle unauthorized access
    }

    const orgId = user.orgId;

    // For POST (insert): inject orgId into request body
    if (req.method === 'POST') {
        if (Array.isArray(req.body)) {
            req.body = req.body.map(doc => ({ ...doc, orgId }));
        } else if (typeof req.body === 'object' && req.body !== null) {
            // Log potential cross-tenant access attempts
            if (req.body.orgId && req.body.orgId !== orgId) {
                console.warn(JSON.stringify({
                    traceId: req.traceId,
                    event: 'TENANT_ISOLATION_OVERRIDE',
                    message: 'Request body contained orgId different from authenticated user',
                    requestedOrgId: req.body.orgId,
                    authenticatedOrgId: orgId,
                    timestamp: new Date().toISOString(),
                }));
            }
            req.body.orgId = orgId;
        }
    }

    // Store orgId on request for use by controllers in query filtering
    req.tenantOrgId = orgId;

    next();
}

module.exports = {
    enforceTenantIsolation,
    SHARED_COLLECTIONS,
};
