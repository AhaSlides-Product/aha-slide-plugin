# External Plugin Group Submodule — Design

**Status**: Draft for review
**Date**: 2026-05-04
**Author**: Dong Tran (with Claude)

## Problem

Today every slide plugin lives either as its own folder under `apps/` (e.g. `apps/sample-slide/`) or as a one-repo-per-plugin git submodule (e.g. `apps/ranking/`, `apps/ideaBoard/`, `apps/pinOnImage/`). Both shapes carry the same per-plugin overhead:

- Creating a new slide type requires a PR into `aha-slide-plugin` or spinning up a new dedicated repo.
- AhaSliders teammates who want to vibe-code experimental slide types have nowhere to ship to without that overhead.

We want a third pattern: **one external repo holding many plugins**, owned by AhaSliders staff, mounted into `aha-slide-plugin` as a single submodule, with no host-repo PR required to add or evolve a plugin inside it.

## Goal

Let the `slide-plugin-built-by-ahasliders` GitHub repo (a single repo with many plugin folders) be:

1. **Buildable and deployable** through the existing `aha-slide-plugin` ECS pipeline — same container, same domain, no infra change.
2. **Locally runnable** through `aha-slide-plugin`'s existing `npm run dev` flow, so a developer can start the server in `aha-slide-plugin` and immediately see/test plugins they're editing inside the external repo.

Non-goals:

- Runtime/dynamic plugin loading from a remote URL.
- Independent hosting of external plugins.
- Sandboxing or trust boundaries different from internal plugins (these are internal staff plugins).

## Architecture

### Layout

```
aha-slide-plugin/                                (host monorepo)
├── apps/
│   ├── sample-slide/                            # internal plugin (today)
│   │   ├── frontend/
│   │   └── backend/
│   ├── ranking/                                 # 1-repo-per-plugin submodule (today)
│   ├── ideaBoard/                               # 1-repo-per-plugin submodule (today)
│   ├── pinOnImage/                              # 1-repo-per-plugin submodule (today)
│   ├── markdown/                                # internal frontend-only plugin (today)
│   ├── infographic/                             # internal frontend-only plugin (today)
│   └── slide-plugin-by-ahasliders/              # NEW: many-plugins-in-one-repo submodule
│       ├── aha-plugin-group.json                # marker file
│       ├── _template/                           # starter, ignored by scanners
│       ├── plugin-1/
│       │   └── frontend/
│       └── plugin-2/
│           ├── frontend/
│           └── backend/
├── packages/                                    # unchanged
├── domains/                                     # unchanged
├── .gitmodules                                  # one entry appended
└── package.json                                 # one workspace glob added
```

### Three plugin-mounting patterns coexist

| Pattern | Example | How it's wired |
|---|---|---|
| Internal folder | `apps/sample-slide/` | normal git folder inside `aha-slide-plugin` |
| One-repo-per-plugin submodule | `apps/ranking/` | submodule of `slide-plugin-ranking-question` |
| Many-plugins-per-repo submodule (NEW) | `apps/slide-plugin-by-ahasliders/<plugin>/` | submodule of `slide-plugin-built-by-ahasliders`, recognized via `aha-plugin-group.json` marker |

The new pattern reuses the existing submodule mechanism — no new infrastructure type.

### Group marker

A folder under `apps/` is treated as a **plugin group** (a wrapper holding multiple plugins) iff it contains a file named `aha-plugin-group.json` at its root. Otherwise it is treated as a single plugin (current behavior, preserved for `apps/ranking/`, `apps/sample-slide/`, etc.).

The marker is owned by the external repo, so the host monorepo never needs to know specific wrapper folder names.

`aha-plugin-group.json` schema:

```json
{
  "name": "Plugins by AhaSliders",
  "source": "https://github.com/AhaSlides-Product/slide-plugin-built-by-ahasliders"
}
```

`name` and `source` are optional metadata for future admin UIs / debugging. The presence of the file is what controls scanner behavior; the contents are advisory.

### Scanner rule

Both auto-generators (`packages/api/scripts/generate-slide-type-enum.js` and `packages/backend-main/scripts/generate-app-module.js`) walk `apps/` with the same logic:

```
plugins = []
for each folder X in apps/:
    if X.name starts with "_" or ".":
        skip
    if apps/X/aha-plugin-group.json exists:
        # X is a group — its children are plugins
        for each folder Y in apps/X/:
            if Y.name starts with "_" or ".":
                skip
            plugins.add({ name: Y.name, dir: apps/X/Y })
    else:
        # X is a plugin itself (today's behavior)
        plugins.add({ name: X.name, dir: apps/X })
```

- Recursion is exactly one level deep — groups cannot contain groups.
- Folders prefixed with `_` or `.` are skipped at every level (lets the external repo carry a `_template/` starter without it being mistaken for a plugin).
- The slide-type enum entry and the NestJS route prefix both use the **leaf** folder name (`plugin-1`), never the group folder name.

### Naming-collision guard

If two leaves resolve to the same folder name (e.g. `apps/ranking/` and `apps/slide-plugin-by-ahasliders/ranking/`), both scanners throw a clear error before generating any output:

```
Slide-type name collision: "ranking" exists in both
  apps/ranking
  apps/slide-plugin-by-ahasliders/ranking
```

The build aborts. Fix by renaming the duplicate.

### npm workspaces

Root `package.json` workspaces array gains one entry:

```json
{
  "workspaces": [
    "apps/*/*",
    "apps/*/*/*",   // NEW — picks up apps/<group>/<plugin>/<frontend|backend>
    "packages/*",
    "domains/*",
    "tests"
  ]
}
```

Both globs are kept — `apps/*/*` for the existing depth (single-plugin folders) and `apps/*/*/*` for the new wrapped depth.

### Submodule wiring

`.gitmodules` already exists with four entries (ranking, ideaBoard, pinOnImage, report). Append:

```
[submodule "apps/slide-plugin-by-ahasliders"]
    path = apps/slide-plugin-by-ahasliders
    url = git@github.com:AhaSlides-Product/slide-plugin-built-by-ahasliders.git
```

CI today already runs the submodule init step (it must, since the existing submodules build). No CI change is required.

## External repo: `slide-plugin-built-by-ahasliders`

### Layout

```
slide-plugin-built-by-ahasliders/
├── README.md                       # how to add a plugin, how to test locally
├── aha-plugin-group.json           # marker file (Section: Group marker)
├── _template/                      # starter copy of sample-slide; ignored by scanners
│   ├── frontend/
│   └── backend/
├── plugin-1/
│   └── frontend/
└── plugin-2/
    ├── frontend/
    └── backend/                    # optional
```

### Per-plugin conventions

- `frontend/package.json` `name`: `@aha-external/<plugin-name>-frontend`
- `backend/package.json` `name` (if present): `@aha-external/<plugin-name>-backend`
- The `@aha-external/` namespace visually separates these from internal `@aha/*` packages and prevents accidental name clashes.
- `frontend/` mirrors `apps/sample-slide/frontend` (Vue 3 + Vite + `@aha/ui`).
- `backend/` (if present) mirrors `apps/sample-slide/backend` (NestJS module exporting `AppModule` from `index.ts`).
- An optional `manifest.template.json` per plugin works with the existing `@aha/toolkit` `build-manifest` flow if the plugin needs its own published manifest.

### `_template/` starter

A ready-to-copy skeleton. Plugin authors run:

```bash
cp -r _template my-new-slide
# rename in package.json files: @aha-external/my-new-slide-frontend (and -backend)
```

The leading `_` keeps it sorted to the top of directory listings and is explicitly skipped by the scanner.

### README

Documents:
- The structure above.
- The `cp -r _template my-new-slide` flow.
- How to test locally via `aha-slide-plugin` (see Workflows below).
- That deploy is owned by the host repo (a submodule SHA bump there releases the plugin).

## Workflows

### Local dev (developer working on a plugin)

First-time clone:

```bash
git clone --recurse-submodules <aha-slide-plugin-url>
cd aha-slide-plugin
npm install
```

Submodule auto-checks out at `apps/slide-plugin-by-ahasliders/`. `npm install` registers all plugin workspaces (internal + the new external ones) in one pass.

Adding a new plugin:

```bash
cd apps/slide-plugin-by-ahasliders
cp -r _template my-new-slide
# edit package.json names → @aha-external/my-new-slide-frontend (and -backend)
cd ../..
npm install                # picks up the new workspace
npm run dev                # boots everything, including the new plugin
```

Editing an existing plugin: edit files inside `apps/slide-plugin-by-ahasliders/<plugin>/`. The submodule directory is a normal git working tree pointing at `slide-plugin-built-by-ahasliders`, so:

```bash
cd apps/slide-plugin-by-ahasliders
git checkout -b my-feature
# edit, commit, push — these go to the external repo
```

Pulling latest external work into a host-repo checkout:

```bash
git submodule update --remote apps/slide-plugin-by-ahasliders
```

### Deploy / release

1. Plugin author pushes to `slide-plugin-built-by-ahasliders/main`.
2. Someone with host-repo access bumps the submodule SHA:

   ```bash
   cd aha-slide-plugin
   git submodule update --remote apps/slide-plugin-by-ahasliders
   git add apps/slide-plugin-by-ahasliders
   git commit -m "bump external plugins"
   git push
   ```

3. The existing ECS pipeline rebuilds and deploys. No infra change.

The submodule SHA bump is the manual gate — it lets the host-repo owner control when external changes ship.

## Total change set

| Where | Change |
|---|---|
| `aha-slide-plugin/.gitmodules` | append `apps/slide-plugin-by-ahasliders` entry |
| `aha-slide-plugin/package.json` | add `apps/*/*/*` to workspaces |
| `aha-slide-plugin/packages/api/scripts/generate-slide-type-enum.js` | apply group-marker scanner rule + collision guard |
| `aha-slide-plugin/packages/backend-main/scripts/generate-app-module.js` | apply group-marker scanner rule + collision guard |
| `slide-plugin-built-by-ahasliders/aha-plugin-group.json` | new file |
| `slide-plugin-built-by-ahasliders/_template/` | starter copy of `sample-slide` |
| `slide-plugin-built-by-ahasliders/README.md` | how-to |

## Trade-offs / things to be aware of

- **Submodule ergonomics**: contributors must remember `--recurse-submodules` on clone and `git submodule update` after pulling main. Same as today's other submodules; existing onboarding docs already cover this.
- **Lockfile churn**: a fresh `npm install` after the workspace glob change will write new entries into `package-lock.json`. Expected and one-time.
- **Scanner duplication**: the same group-marker logic lives in two scripts (`generate-slide-type-enum.js` and `generate-app-module.js`). The simplest path is to duplicate ~15 lines; if it grows, extract to a shared helper module under `packages/`.
- **No groups inside groups**: the rule recurses exactly one level. If we ever need nested groups, the rule will need to revisit.
