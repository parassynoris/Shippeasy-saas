# AGENTS.md

This file provides guidance for AI coding agents working in the Shippeasy SaaS monorepo.

## Repository Structure

```
shipeasy/          # Angular 13 frontend (PWA)
shipeasy-api/      # Node.js / Express backend (REST API)
docs/              # Compliance and CI/CD documentation
```

This is a monorepo with two independent apps. There are no npm/yarn workspaces — each app has its own `package.json` and dependency management.

## Tech Stack

- **Frontend**: Angular 13.3, TypeScript 4.6, Angular Material, Bootstrap 5, NG-Zorro, SCSS
- **Backend**: Node.js 22, Express 4, Mongoose 8 (MongoDB), Socket.io 4, CommonJS modules
- **Database**: MongoDB 6+
- **CI/CD**: Azure Pipelines (primary), GitHub Actions (manual fallback)
- **Deployment**: Docker Compose on AWS EC2, images pushed to Azure Container Registry

## Build & Run Commands

### Backend (`shipeasy-api/`)

```bash
npm install
npm start           # runs node index.js on port 3000
npm test            # Jest with --testTimeout=5000 --detectOpenHandles
```

### Frontend (`shipeasy/`)

```bash
yarn install
yarn start          # dev server on port 4200 (proxies /api/* to backend)
yarn test           # Karma + Jasmine unit tests
yarn lint           # ESLint via Angular ESLint
yarn e2e            # Protractor E2E tests
```

For CI-style headless testing: `yarn test --watch=false --browsers=ChromeHeadless`

### Docker (repo root)

```bash
docker compose up --build -d                                                    # production
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build       # dev (hot reload)
```

## Code Style & Conventions

### Frontend (Angular / TypeScript)

- **Linter**: ESLint (`.eslintrc.json`). Legacy TSLint config (`tslint.json`) also exists but ESLint is authoritative.
- **Component selectors**: element selectors, prefix `app`, kebab-case (e.g., `app-my-component`).
- **Directive selectors**: attribute selectors, prefix `app`, camelCase (e.g., `appMyDirective`).
- **Quotes**: single quotes.
- **Semicolons**: always.
- **Max line length**: 140 characters.
- **Console usage**: `console.info` and `console.error` only — `console.log`, `console.debug`, `console.warn` are errors.
- **Unused variables**: treated as errors.
- **Indentation**: spaces (not tabs).
- **Member ordering**: static fields, instance fields, static methods, instance methods.
- **Stylesheets**: SCSS.
- **Module structure**: `admin/`, `layout/`, `auth/`, `models/`, `services/`, `shared/` under `src/app/`.
- **Spec files**: colocated with their components as `*.spec.ts`.

### Backend (Node.js)

- **Module system**: CommonJS (`require` / `module.exports`).
- **Entry point**: `index.js`.
- **Directory layout**: `router/`, `service/`, `schema/`, `middleware/`, `tests/`.
- No ESLint or Prettier config — follow existing code style.

## Testing

### Backend

- **Framework**: Jest 29 with Supertest for HTTP assertions.
- **Test location**: `shipeasy-api/tests/`.
- **CI command**: `npm test -- --ci --forceExit --reporters=jest-junit`
- **Environment**: set `NODE_ENV=test`.

### Frontend

- **Framework**: Karma + Jasmine.
- **Test location**: `*.spec.ts` files colocated with source files (~384 spec files).
- **Coverage output**: `coverage/baxi/`.
- **CI command**: `yarn test --watch=false --browsers=ChromeHeadless`
- **E2E**: Protractor (`e2e/src/**/*.e2e-spec.ts`), base URL `http://localhost:4200/`.

## CI/CD Pipeline

The primary CI system is **Azure Pipelines** (`azure-pipelines.yml` at the repo root).

Pipeline stages:
1. **DetectChanges** — git diff to determine which app(s) changed.
2. **Test** — runs backend (Jest, Node 22) and frontend (Karma headless, Node 20) tests conditionally.
3. **BuildPush** — builds Docker images, pushes to ACR (only on push to `main`).
4. **Deploy** — SSH to AWS EC2 and runs `deploy.sh` (only on push to `main`).

Triggers: pushes and PRs to `main` that touch `shipeasy/`, `shipeasy-api/`, `docker-compose.yml`, `azure-pipelines.yml`, or `deploy.sh`.

## Important Notes

- The frontend package name is `smartagent` and the Angular project name is `baxi` (in `angular.json`); the build output goes to `dist/smartagent`.
- The frontend dev server proxies `/api/*` requests via `src/proxy.conf.json` — this may point to a remote URL by default; adjust for local backend development.
- Backend environment variables are configured via `.env` (see `.env.example`). Required vars include `MONGO_URI`, `JWT_SECRET`, and various service credentials.
- Frontend environment config lives in `shipeasy/src/environments/environment.ts` and variant files.
- The frontend uses `--max_old_space_size=6096` for the dev server and `4096` for tests due to Angular 13's memory requirements.
- Frontend CI tests use `continueOnError: true` — the test suite is not yet fully stable.
