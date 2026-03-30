# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Slide plugin monorepo for AhaSlides. Each slide type (quiz, poll, word cloud, etc.) is an independent app with its own frontend (Vue 3) and backend (NestJS). Shared code lives in `packages/`. Built with Turborepo + npm workspaces.

## Stack

- **Frontend**: Vue 3, Vite, TypeScript, Ant Design Vue 4, Tailwind CSS 4
- **Backend**: NestJS 11, TypeScript
- **Monorepo**: Turborepo 2.7, npm workspaces
- **Testing**: Playwright (E2E), Vitest (unit/consumer), Jest (backend)

## Commands

```bash
npm install                # Install all workspace dependencies
npm run build              # Build all packages (Turborepo cached)
npm run dev                # Dev mode for all workspaces
npm run test               # Run all tests
npm run test:e2e           # Playwright E2E tests
npm run test:consumer      # Consumer contract tests (Vitest)
npm run storybook          # UI component documentation
npm run docs               # Generate TypeDoc documentation
npm run clean              # Clean all build outputs and caches
```

To work on a specific workspace:
```bash
npm run dev -w @aha/sample-slide-frontend    # Dev a specific app
npm run test -w @aha/sample-slide-backend    # Test a specific package
```

## Project Structure

```
apps/                       # Slide applications (one per slide type)
  sample-slide/             # Reference implementation — copy this for new slides
    frontend/               # Vue 3 app (@aha/sample-slide-frontend)
    backend/                # NestJS service (@aha/sample-slide-backend)
  ideaBoard/                # Idea board slide
  pinOnImage/               # Pin on image slide
  ranking/                  # Ranking slide
packages/                   # Shared libraries
  ui/                       # @aha/ui — Vue 3 components, useSync/useSyncReadOnly hooks
  backend-main/             # @aha/backend-main — aggregated NestJS server (auto-imports all slide backends)
  backend-utils/            # @aha/backend-utils — shared DTOs and utilities
  common/                   # @aha/common — shared types/utils (CJS + ESM)
  db/                       # @aha/db — IndexedDB wrapper for client persistence
  api/                      # @aha/api — shared API types, auto-generated slide-type enum
  storybook/                # @aha/storybook — component documentation
domains/
  report/                   # aha-report — standalone report app (Vue 3, embedded as iframe)
tests/                      # Playwright E2E tests
mcp_server/                 # Python MCP server for slide plugin specs
```

## Key Concepts

### Adding a New Slide Type
1. Copy `apps/sample-slide/` to `apps/<new-slide>/`
2. Update package names in both `frontend/package.json` and `backend/package.json`
3. `@aha/backend-main` auto-discovers and mounts the backend under `/api/plugins/{slide-type}/*`
4. `@aha/api` auto-generates the slide-type enum from app directories

### State Sync
- `useSync()` from `@aha/ui` — read/write sync between canvas and settings panels (cross-tab)
- `useSyncReadOnly()` — read-only sync for audience-facing views
- Backed by Zoid for iframe communication

### Backend Aggregation
`@aha/backend-main` is a single NestJS server that auto-imports all slide backend modules. Each slide backend registers its own routes under a unique prefix.

## Code Conventions

- **Vue components**: PascalCase (e.g., `UserProfile.vue`)
- **Directories**: snake_case (e.g., `components/user_profile/`)
- **TypeScript files**: camelCase (e.g., `useUserProfile.ts`)
- **Import hierarchy**: Composables -> Stores -> Services (enforced directionality)
- **State management**: Pinia for global state; composables or TanStack Query for component-scoped state

### Frontend Structure (per app)
```
src/
  components/    # Feature-specific and shared components
  composables/   # Reusable logic hooks
  services/      # API calls and business logic
  stores/        # Pinia stores (auth, feature flags, global UI)
  pages/         # Route-mapped page components
  config/        # Environment config
  types/         # TypeScript type definitions
  utils/         # Generic utilities
```

## Report Domain

The `domains/report/` app is a standalone Vue 3 SPA embedded as an iframe in the presenter app. See `domains/report/CLAUDE.md` for its specific conventions.
