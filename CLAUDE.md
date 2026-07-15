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

## Branding & UI Conventions (applies to EVERY plugin)

There are two visual surfaces in every plugin and they follow **different** branding rules. Mixing them up makes the canvas look like a different product from the rest of AhaSlides — UT 2026-05-27 flagged this on Content V2.

### 1. Plugin chrome — settings panel, modals, toolbars, popovers, dialogs

Anything the **presenter** sees while authoring a slide. This is AhaSlides product UI and must follow the AhaSlides brand guidelines verbatim.

**Typography:**
- Plus Jakarta Sans only — never Inter, Poppins, Helvetica, SF Pro, etc.
- Weights: 400 / 500 / 600 / 700 / 800.
- Headlines sentence case, never end with a period.
- Source the font via `@aha/ui/ahaslides-vars.css` import + the inline `@import` in your `style.css`.
- AntD ConfigProvider's `token.fontFamily` must resolve to Plus Jakarta Sans, NOT to `--aha-fontFamily` — see `apps/slide-plugin-by-ahasliders/canvas/frontend/src/theme.ts:23-44` for the pattern. `@aha/ui-vanilla`'s `installHostFontAutoLoad` overwrites `--aha-fontFamily` with the deck font, which is correct for slide content but would bleed the deck font into your toolbar.

**Colours:**
- Drive every chrome colour through the `--aha-*` CSS variable surface (`--aha-colorPrimary`, `--aha-colorBorder`, `--aha-colorText`, `--aha-colorPrimaryBg`, `--aha-colorTextSecondary`, etc.). These are wired to the AhaSlides Design System V3 tokens by `@aha/ui/ahaslides-vars.css`.
- Brand primary in product UI is **Violet Purple `#6A1EBB`** (`--aha-colorPrimary`). Selection rings, primary buttons, active-tab indicators, focused-input borders all use this.
- Brand identity / highlights are **Radical Pink `#FF4081`** — use sparingly for marketing-leaning moments inside the chrome (logo touches, hero CTAs).
- Forbid arbitrary hex values for chrome (`#3b82f6`, `#ec4899`, `#cbd5e1`, etc.). If a chrome control needs a tone outside the token surface, add the token to `@aha/ui` first.
- **No gradients anywhere.** Brand rule. Flat fills only.

**Copy & tone:**
- Conversational, playful but never silly. Avoid corporate jargon ("leverage", "synergy", "utilize"). Speak like a friendly engagement expert.
- CTAs are short and active ("Insert block", "Browse template gallery →"), never "Click here" / "Learn more".
- Tooltip / placeholder text reinforces the same tone — "Search 1700+ icons — try 'arrow', 'check', 'user'…" beats "Search icons".
- Skim `/home/zuzu/.claude/plugins/cache/aha-claude-plugins/aha-branding/1.1.0/skills/aha-branding-tone-voice` for the canonical voice cheat-sheet before shipping new strings.

### 2. Slide content — what ends up rendered for the audience

Anything that **gets serialised into the slide** and shown to participants when presenting. This must follow the **theme passed from the host** (the deck's font, colour palette, theme tokens), not the AhaSlides product chrome.

- Font: read `theme.fontFamily` (delivered via xprops at runtime) and apply inline. Never hardcode Plus Jakarta Sans into rendered content. Reference: `apps/slide-plugin-by-ahasliders/canvas/frontend/src/components/SlideRenderer.tsx:202`.
- Colours: resolve theme tokens (`primary` / `secondary` / `bg` / `text` / `muted` / `auto`) through the host-provided theme. Hex values from user input pass through unchanged. See `resolveColor()` in SlideRenderer for the merge order: theme keyword → host theme value, hex/gradient → verbatim.
- The deck owns the look of its content. The plugin owns nothing in the rendered slide except behaviour.

### Reference implementations

When in doubt about a chrome decision, check how these three plugins already solved it:

- **`apps/ideaBoard/frontend/`** — canonical pattern for the right-side settings panel: `src/style.css` (`var(--aha-fontFamily)` for chrome surfaces, scrollbar tokens, antd tab overrides), `src/pages/Settings.vue` (panel structure), `src/composables/useTheme.ts` (theme token consumption).
- **`apps/ranking/frontend/`** — audience-side branding for an interactive plugin: `src/style.css` + `src/components/AudienceViewItem.vue` + `src/pages/RankingAudience.vue` show how chrome tokens (`--aha-colorPrimary*`) drive interactive states without leaking into the rendered slide.
- **`apps/pinOnImage/frontend/`** — image-driven plugin with both chrome controls and pinned audience overlays.

### Skill reference

The `aha-branding` plugin ships these skills with the exhaustive guidance — read them when designing a new screen or onboarding a new contributor:

- `aha-branding:aha-branding-colors` — full hex / RGB / CMYK / Pantone palette + pairing rules + WCAG targets
- `aha-branding:aha-branding-typography` — type hierarchy, weight pairing rules, leading
- `aha-branding:aha-branding-tone-voice` — voice cheat-sheet, copy style checklist, brand spices
- `aha-branding:aha-branding-image` — imagery and illustration usage
- `aha-branding:aha-branding-backgrounds` — pattern / texture / background rules

### Pre-merge checklist (per plugin)

- [ ] AntD `ConfigProvider` `token.fontFamily` resolves to Plus Jakarta Sans for chrome
- [ ] `theme.fontFamily` (host-provided) drives slide content, not Plus Jakarta Sans
- [ ] All chrome colours flow through `--aha-*` tokens (or are fallbacks INSIDE a `var()`)
- [ ] No raw hex outside content rendering, audit pages, and `var(...)` fallbacks
- [ ] No gradients in chrome
- [ ] Headlines sentence case, no trailing periods
- [ ] CTAs are short + active
- [ ] Tooltips / placeholders match AhaSlides voice (specific, helpful, friendly)
