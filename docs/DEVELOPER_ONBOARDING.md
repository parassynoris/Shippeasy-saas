# Developer Onboarding Guide

Welcome to the Shippeasy SaaS platform! This guide will help you get set up and productive quickly.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Security Guidelines](#security-guidelines)
- [Key Patterns & Conventions](#key-patterns--conventions)

---

## Architecture Overview

Shippeasy is a multi-tenant SaaS platform for freight forwarding and logistics management. It consists of:

| Component | Technology | Directory |
|-----------|-----------|-----------|
| **Backend API** | Node.js + Express + Mongoose | `shipeasy-api/` |
| **Frontend** | Angular 17 | `shipeasy/` |
| **Database** | MongoDB 6 | Docker container |
| **File Storage** | Azure Blob Storage | External service |
| **Messaging** | WhatsApp Business API | External service |
| **Queue** | BullMQ + Redis | Optional |

### Key Middleware Stack (applied in order)

1. **helmet** — Security headers (CSP, HSTS, X-Frame-Options)
2. **compression** — Gzip response compression
3. **cors** — Configurable origin whitelist
4. **express.json** — Body parsing (1MB default limit)
5. **sanitizeInput** — NoSQL injection prevention
6. **requestTracer** — Request tracing with UUID correlation
7. **apiLimiter** — General rate limiting (100 req/15min/IP)
8. **validateAuth** — JWT + Google OAuth authentication
9. **enforceTenantIsolation** — orgId scoping for multi-tenancy
10. **tenantRateLimit** — Per-tenant rate limiting by plan
11. **usageMetering** — API usage tracking per organization
12. **checkPlanAccess** — Feature gating by subscription plan

---

## Prerequisites

- **Node.js** 18.x or later
- **npm** or **yarn**
- **Docker** & **Docker Compose**
- **Git**
- **MongoDB Compass** (optional, for database inspection)

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd Shippeasy-saas
```

### 2. Set up environment variables

```bash
# Backend
cp shipeasy-api/.env.example shipeasy-api/.env
# Edit .env with your actual values (see .env.example for documentation)
```

### 3. Start with Docker Compose (recommended)

```bash
docker compose up --build
```

This starts:
- MongoDB on port `27017`
- Backend API on port `3000`
- Frontend on port `80`

### 4. Start individually (for development)

**Backend:**
```bash
cd shipeasy-api
npm install
npm start          # Production mode
npm run dev        # Development mode (if configured)
```

**Frontend:**
```bash
cd shipeasy
yarn install
yarn start         # Development server on port 4200
```

---

## Project Structure

```
shipeasy-api/
├── controller/          # Route handlers (24 controllers)
│   ├── auth.controller.js          # Authentication, login, password mgmt
│   ├── search.controller.js        # Generic search with pagination
│   ├── insert.commonController.js  # Generic document insertion
│   ├── update.commonController.js  # Generic document updates
│   ├── delete.commonController.js  # Generic document deletion
│   ├── helper.controller.js        # Shared utilities and imports
│   └── ...
├── middleware/          # Express middleware
│   ├── auth.js              # JWT/OAuth authentication
│   ├── security.js          # Helmet, rate limiting, NoSQL prevention
│   ├── validation.js        # Input validation schemas
│   ├── tenant.js            # Tenant isolation (orgId enforcement)
│   ├── planEnforcement.js   # Subscription plan feature gating
│   ├── usageTracking.js     # Per-tenant rate limiting & usage metering
│   ├── webhookAuth.js       # Webhook signature verification
│   ├── fileValidation.js    # File upload MIME/extension validation
│   ├── requestTracer.js     # Request tracing & encryption
│   └── checkIndex.js        # Collection name validation
├── schema/             # Mongoose schemas
│   └── schema.js            # All collection schemas + indexes
├── service/            # Business services
│   ├── mongooseConnection.js   # DB connection with pooling
│   ├── socketHelper.js         # Socket.io real-time events
│   ├── queue.js                # BullMQ job queue
│   └── ...
├── utils/              # Utility modules
│   └── featureFlags.js      # Feature flag system
├── router/
│   └── route.js             # All API routes
├── tests/
│   └── retrieval.test.js    # Integration tests
├── index.js            # Express app entry point
└── .env.example        # Environment variable documentation
```

---

## Development Workflow

### Making Changes

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes
3. Test locally
4. Push and create a PR

### Adding a New API Endpoint

1. Add route in `router/route.js`
2. Create or update controller in `controller/`
3. If needed, add schema in `schema/schema.js`
4. Add input validation in `middleware/validation.js`
5. Add tests in `tests/`

### Adding a New Collection/Schema

1. Add schema definition to `schema/schema.js` (in the `schemas` object)
2. Add database indexes to `collectionIndexes` (in schema.js)
3. The collection will automatically get audit logging and tenant isolation

---

## Testing

```bash
cd shipeasy-api

# Run all tests
npm test

# Run with coverage
npx jest --coverage
```

Test credentials are loaded from environment variables:
- `TEST_USERNAME` — Test user login
- `TEST_PASSWORD` — Test user password

---

## Security Guidelines

### Never Do:
- ❌ Hardcode secrets, tokens, or API keys in source code
- ❌ Commit `.env` files
- ❌ Log sensitive fields (passwords, tokens, API keys)
- ❌ Trust client-supplied MIME types without validation
- ❌ Skip input validation on new endpoints
- ❌ Allow cross-tenant data access

### Always Do:
- ✅ Use environment variables for all secrets
- ✅ Add `validateAuth` middleware to protected routes
- ✅ Add input validation for user-facing endpoints
- ✅ Use `enforceTenantIsolation` for multi-tenant data
- ✅ Verify webhook signatures for external integrations
- ✅ Validate file uploads (type, size, extension)

---

## Key Patterns & Conventions

### Multi-Tenancy
All data is isolated by `orgId`. The `enforceTenantIsolation` middleware automatically injects `orgId` on inserts and logs cross-tenant access attempts.

### Authentication
- JWT tokens (24h expiry) with `tokenVersion` for session invalidation
- Google OAuth as fallback
- Bcrypt password hashing (legacy plaintext auto-migrated on login)

### Generic CRUD
The app uses a generic CRUD pattern where `:indexName` maps to MongoDB collections. The `checkIndex` middleware validates allowed collection names.

### Feature Flags
Use `utils/featureFlags.js` to gate features by plan:

```javascript
const { isFeatureEnabled } = require('./utils/featureFlags');

if (isFeatureEnabled('edi_processing', { orgId, plan: 'pro' })) {
    // Feature is available
}
```

### Error Handling
Use try/catch with structured JSON logging:

```javascript
try {
    // ... operation
} catch (err) {
    console.error(JSON.stringify({
        traceId: req?.traceId,
        error: err.message,
        stack: err?.stack
    }));
    res.status(500).json({ error: 'Operation failed' });
}
```

---

## Useful Commands

| Command | Description |
|---------|-------------|
| `docker compose up --build` | Start all services |
| `docker compose logs -f backend` | Tail backend logs |
| `cd shipeasy-api && npm test` | Run backend tests |
| `cd shipeasy && yarn test` | Run frontend tests |
| `cd shipeasy && yarn build` | Build frontend for production |

---

## Need Help?

- Check `docs/ENGINEERING_AUDIT_REPORT.md` for detailed architecture documentation
- Check `docs/` directory for compliance and CI/CD guides
- Review existing controllers for patterns to follow
