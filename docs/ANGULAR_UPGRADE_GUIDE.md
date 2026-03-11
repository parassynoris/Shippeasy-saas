# Angular Upgrade Guide: 13 → 17+

**Status**: Planning — prerequisite blockers identified and documented below.

## Current State

- Angular 13.3.11 (EOL since November 2023)
- TypeScript 4.6.4
- Node 20 (build), Node 22 (runtime)
- RxJS 6.5.5
- Angular Material 13.3.9
- NG-Zorro 13.3.2

## Upgrade Path

Angular requires sequential major version upgrades. Each step has breaking changes.

### Step 1: Angular 13 → 14

**Breaking changes**:
- TypeScript 4.6 → 4.7+ required
- `@angular/flex-layout` deprecated (remove and replace with CSS grid/flexbox)
- Forms: `AbstractControl.value` now typed
- `RouterModule.forRoot()` options changes

**Blockers to fix first**:
- Remove `@angular/flex-layout` (already ^13.0.0-beta.36)
- Update RxJS 6.5 → 7.x (required for Angular 14)
- Replace deprecated `RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })`

**Commands**:
```bash
npx @angular/cli@14 update @angular/core@14 @angular/cli@14
npx @angular/cli@14 update @angular/material@14
```

### Step 2: Angular 14 → 15

**Breaking changes**:
- Standalone components introduced (opt-in)
- `@angular/material` MDC-based components (visual changes)
- `RouterModule` → standalone `provideRouter()`
- `HttpClientModule` → standalone `provideHttpClient()`
- Node 14 dropped; Node 18+ required

**Key migration**:
- Material MDC migration (all component selectors change)
- `ng update @angular/material@15` runs schematic

### Step 3: Angular 15 → 16

**Breaking changes**:
- Signals introduced (opt-in)
- `DestroyRef` for cleanup
- Required inputs
- Vite/esbuild builder (opt-in)

### Step 4: Angular 16 → 17

**Breaking changes**:
- New control flow (`@if`, `@for`, `@switch`)
- Deferrable views (`@defer`)
- Standalone by default
- New application builder (esbuild)

## Pre-Upgrade Checklist

- [ ] Remove `@angular/flex-layout` — replace with CSS grid utilities
- [ ] Upgrade RxJS 6.5 → 7.x
- [ ] Remove `codelyzer` (replaced by `@angular-eslint`)
- [ ] Remove `protractor` (deprecated; replace with Cypress)
- [ ] Remove `tslint` references (ESLint is already configured)
- [ ] Fix all 166 `noImplicitReturns` violations
- [ ] Fix all `strictNullChecks` violations (incremental)
- [ ] Remove `@nicky-lenaers/ngx-scroll-to` (not Angular 14+ compatible)
- [ ] Update `ng-zorro-antd` to version compatible with target Angular
- [ ] Update `@ng-bootstrap/ng-bootstrap` to version compatible with target Angular
- [ ] Update `angular-archwizard` to version compatible with target Angular

## Estimated Effort

| Step | Effort | Risk |
|------|--------|------|
| Pre-upgrade blockers | 1 week | Medium |
| 13 → 14 | 2-3 days | Medium |
| 14 → 15 (Material MDC) | 1 week | High |
| 15 → 16 | 2-3 days | Low |
| 16 → 17 | 2-3 days | Low |
| Testing & stabilization | 1 week | Medium |
| **Total** | **4-5 weeks** | |

## UI Library Strategy (Phase 3, Task 16)

The codebase uses 4 UI libraries simultaneously. The recommended path:

1. **Keep Angular Material** as the primary component library
2. **Migrate NG-Zorro components** to Material equivalents during the Angular 15 upgrade (Material MDC migration is already required)
3. **Keep Bootstrap 5** for layout utilities only (grid, spacing)
4. **Remove ng-bootstrap** after migrating modals to Material Dialog and dropdowns to Material Menu

## State Management Strategy (Phase 3, Task 17)

NgRx adoption should follow the Angular upgrade:

1. Install `@ngrx/store`, `@ngrx/effects`, `@ngrx/entity`
2. Start with auth state (currently in localStorage + BehaviorSubjects)
3. Add entity state for frequently-accessed data (batches, enquiries)
4. Migrate services with BehaviorSubjects incrementally
