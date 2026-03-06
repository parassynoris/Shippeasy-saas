/**
 * Feature flags utility module.
 *
 * Provides a centralized mechanism for enabling/disabling features
 * per tenant, plan, or globally. Supports:
 * - Static flag definitions (in-code defaults)
 * - Environment variable overrides
 * - Per-tenant overrides (from database)
 *
 * Usage:
 *   const { isFeatureEnabled } = require('./utils/featureFlags');
 *   if (isFeatureEnabled('edi_processing', { orgId, plan })) { ... }
 */

/**
 * Default feature flag definitions.
 * Each flag specifies which plans it's available on and whether it's globally enabled.
 *
 * In production, this would be augmented by a database collection or
 * external service (LaunchDarkly, Unleash, etc.).
 */
const FLAG_DEFINITIONS = {
    // Core features
    quotation_management: {
        description: 'Quotation creation and management',
        plans: ['free', 'pro', 'enterprise'],
        enabled: true,
    },
    job_management: {
        description: 'Job/shipment lifecycle management',
        plans: ['free', 'pro', 'enterprise'],
        enabled: true,
    },

    // Pro features
    edi_processing: {
        description: 'EDI document generation (EGM, IGM)',
        plans: ['pro', 'enterprise'],
        enabled: true,
    },
    einvoicing: {
        description: 'E-invoicing via Zircon (GST India)',
        plans: ['pro', 'enterprise'],
        enabled: true,
    },
    tally_integration: {
        description: 'Tally accounting export',
        plans: ['pro', 'enterprise'],
        enabled: true,
    },
    load_planning: {
        description: 'Container load optimization',
        plans: ['pro', 'enterprise'],
        enabled: true,
    },
    batch_email: {
        description: 'Batch email sending via SendInBlue',
        plans: ['pro', 'enterprise'],
        enabled: true,
    },
    credit_reports: {
        description: 'Agent credit assessment reports',
        plans: ['pro', 'enterprise'],
        enabled: true,
    },

    // Enterprise features
    whatsapp_integration: {
        description: 'WhatsApp Business API integration',
        plans: ['enterprise'],
        enabled: true,
    },
    ai_document_scanning: {
        description: 'AI-powered document scanning (OpenAI/Gemini)',
        plans: ['enterprise'],
        enabled: true,
    },
    custom_automations: {
        description: 'Configurable workflow automations',
        plans: ['enterprise'],
        enabled: true,
    },
    api_access: {
        description: 'REST API access for integrations',
        plans: ['enterprise'],
        enabled: true,
    },

    // Experimental / beta features
    bold_bi_analytics: {
        description: 'Embedded Bold BI analytics dashboards',
        plans: ['enterprise'],
        enabled: false,  // Disabled by default — enable per-tenant
    },
};

/**
 * In-memory cache for per-tenant flag overrides.
 * In production, these would be loaded from a database collection.
 */
const tenantOverrides = new Map();

/**
 * Check if a feature flag is enabled for a given context.
 *
 * Resolution order:
 * 1. Environment variable override: FEATURE_FLAG_{FLAG_NAME}=true/false
 * 2. Per-tenant override (if orgId provided)
 * 3. Plan-based access (if plan provided)
 * 4. Global flag default
 *
 * @param {string} flagName - The feature flag identifier
 * @param {Object} context - Context for evaluation
 * @param {string} context.orgId - Tenant organization ID
 * @param {string} context.plan - Tenant subscription plan
 * @returns {boolean} Whether the feature is enabled
 */
function isFeatureEnabled(flagName, context = {}) {
    const flag = FLAG_DEFINITIONS[flagName];
    if (!flag) {
        return false;  // Unknown flag defaults to disabled
    }

    // 1. Environment variable override
    const envKey = `FEATURE_FLAG_${flagName.toUpperCase()}`;
    const envValue = process.env[envKey];
    if (envValue !== undefined) {
        return envValue === 'true' || envValue === '1';
    }

    // 2. Per-tenant override
    if (context.orgId) {
        const overrides = tenantOverrides.get(context.orgId);
        if (overrides && overrides[flagName] !== undefined) {
            return overrides[flagName];
        }
    }

    // 3. Plan-based access
    if (context.plan && flag.plans) {
        if (!flag.plans.includes(context.plan)) {
            return false;
        }
    }

    // 4. Global default
    return flag.enabled;
}

/**
 * Set a per-tenant feature flag override.
 *
 * @param {string} orgId - Organization ID
 * @param {string} flagName - Feature flag name
 * @param {boolean} enabled - Whether to enable or disable
 */
function setTenantOverride(orgId, flagName, enabled) {
    if (!tenantOverrides.has(orgId)) {
        tenantOverrides.set(orgId, {});
    }
    tenantOverrides.get(orgId)[flagName] = enabled;
}

/**
 * Get all feature flags and their status for a given context.
 *
 * @param {Object} context - Context for evaluation
 * @returns {Object} Map of flag names to their enabled status
 */
function getAllFlags(context = {}) {
    const result = {};
    for (const flagName of Object.keys(FLAG_DEFINITIONS)) {
        result[flagName] = {
            enabled: isFeatureEnabled(flagName, context),
            description: FLAG_DEFINITIONS[flagName].description,
            plans: FLAG_DEFINITIONS[flagName].plans,
        };
    }
    return result;
}

module.exports = {
    isFeatureEnabled,
    setTenantOverride,
    getAllFlags,
    FLAG_DEFINITIONS,
};
