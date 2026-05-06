# Content slide plugin — design spec

**Date:** 2026-05-05
**Author:** Dong Tran (with Claude Code as scribe)
**Status:** Approved — ready for implementation
**Scope:** v1 of a freeform, LLM-friendly content slide plugin to replace the legacy Vue 2 + TinyMCE content slide

---

## 1. Goal & motivation

Replace the legacy Vue 2 + TinyMCE content slide with a modern, freeform, PowerPoint-like editor that is also first-class authorable by AhaSlides' Slides Agent (LLM).

The current TinyMCE content slide is buggy, runs an outdated TinyMCE version, lives inside the Vue 2 monolith (hard to upgrade), and produces structures the LLM struggles to author cleanly. We solve all of those by isolating the new slide as an independent plugin in `apps/slide-plugin-by-ahasliders/content/`, building it on Vue-3-era tooling (React in our case), and giving the LLM a structured DSL contract instead of free-form HTML.

Old TinyMCE slides remain in the product as a separate slide type. **No migration in v1.**

---

## 2. Architecture

### 2.1 Type & deployment
- Pure-frontend React plugin (no backend Worker).
- Folder: `apps/slide-plugin-by-ahasliders/content/frontend/`.
- Package: `@aha-external/content-frontend`.
- Manually scaffolded (the group's `_template/` is Vue 3; this plugin is React, so the `./scripts/new-plugin.sh` script doesn't fit).
- Deploys via the plugin group's existing CI workflow (FE bundle uploaded, no Worker).

### 2.2 Framework choice — React 19

The aha-slide-plugin SDK is **framework-agnostic by design**. `@aha/ui-vanilla` is the canonical SDK; framework packages (`@aha/ui` Vue) are wrappers, not the destination. This plugin is React because:

1. The React ecosystem for canvas editors and rich-text composition is materially better (`tldraw`, `BlockNote`, `@dnd-kit`, `lexical`, `slate`). v2/v3 ambitions ("PowerPoint-and-beyond") benefit decisively from this.
2. `@tiptap/react` is first-class (Vue's parity package exists too — wash for v1, but React stays open for swapping in heavier libraries later).
3. Host integration for React is already proven (the abandoned `apps/markdown/` prototype).

**Trade-offs accepted:**
- We re-implement host sync hooks for React in this plugin (one-time, ~30 LOC adapters).
- This plugin is the React outlier in a mostly-Vue plugin group. Future React plugins reuse the same patterns.

### 2.3 Routes (matches sample-slide convention)

- `/:type/canvas/:slideId` → `Canvas.tsx` — 1280×720 inline editor with full direct manipulation.
- `/:type/:slideId/canvas-modal` → `CanvasModal.tsx` — fullscreen editor for dense slides.
- `/:type/settings/:slideId` → `Settings.tsx` — Insert / Properties / AI Generate panel.
- `/:type/audience/:slideId` → `Audience.tsx` — read-only render for audience web.
- `/:type/audience-modal/:slideId` → `AudienceModal.tsx` — fullscreen audience.

### 2.4 Source layout

```
apps/slide-plugin-by-ahasliders/content/frontend/
  package.json
  index.html
  vite.config.ts
  src/
    main.tsx                       # react-router + StrictMode bootstrap
    router.tsx
    pages/
      Canvas.tsx, CanvasModal.tsx, Settings.tsx
      Audience.tsx, AudienceModal.tsx
    components/
      SlideEditor.tsx              # canvas + selection + drag/resize/rotate + smart guides
      SlideRenderer.tsx            # read-only render
      SettingsPanel.tsx
      blocks/
        TextBlock.tsx              # @tiptap/react inside
        ImageBlock.tsx, ShapeBlock.tsx
      primitives/
        DragHandle.tsx, ResizeHandle.tsx, RotateHandle.tsx
        SmartGuides.tsx, AnchorPicker.tsx
    hooks/
      useSync.ts                   # thin React adapter over @aha/ui-vanilla createSync
      useSyncReadOnly.ts
      useReportHeight.ts
      useSlideDocument.ts          # uses useSync(slideId, dsl-string)
      useSelection.ts, useSnapping.ts, useDsl.ts, useAnchors.ts
    core/                          # framework-agnostic engine, plain TS
      dsl/                         # parser + serializer
      anchors/                     # anchor → x/y/w/h on 1280×720
      snapping/                    # snap math + smart-guide computation
      repair/                      # validator (LLM safety net)
      undo/                        # command + history stack
      llm/                         # system-prompt.md asset
      types.ts                     # Block, SlideDoc, Anchor, etc.
    services/
      api.ts                       # parity with template; calls host LLM endpoint

packages/ui-vanilla/src/
  sync.ts                          # NEW: createSync / createReadOnlySync / createHeightReporter
  index.ts                         # re-export sync
```

### 2.5 Out-of-package work

- **Promote sync to `@aha/ui-vanilla`** — add `createSync`, `createReadOnlySync`, `createHeightReporter` as plain TypeScript functions. Minor version bump (1.0.8 → 1.1.0). No breaking changes.
- **`@aha/ui` (Vue) is NOT migrated in v1.** It keeps its existing implementation. A separate PR can later make it delegate to `@aha/ui-vanilla` for single-source-of-truth — out of scope here. Reduces blast radius.

The untracked top-level `apps/markdown/` (React prototype) is **abandoned and not touched**.

---

## 3. Data model + DSL

### 3.1 DSL syntax (MyST-flavored, Markdown body)

- **Frontmatter** (YAML): `canvas`, `version`. Slide-level metadata only.
- **Blocks**: `:::type attr=val attr=val ::: ` fences. Body between fences is Markdown for `text` blocks; empty for `image` / `shape`.
- **Position is mutually exclusive**: either `at=<anchor>` (with optional `width=` / `height=` percentages and `offsetX=` / `offsetY=` nudges) — or raw `x y w h` in pixels (pixel-pinned).
- **Z-order = file order.** Last block on top.
- **Inline rich text** in text bodies: standard Markdown (`**bold**`, `*italic*`, `# H1`, `- bullets`, `1. ordered`, `> quote`, `[link](url)`).

Example (anchored slide, post-user-nudge):

```
---
canvas: 1280x720
version: 1
---

:::text at=top-center width=86% preset=title align=left
# Q4 revenue grew **42%** YoY
:::

:::text at=left-half offsetY=100 preset=body
Three regions all hit their targets. APAC had the strongest acceleration.

- **North America** — $4.2M (+38%)
- **Europe** — $2.8M (+29%)
- **APAC** — $1.5M (+71%)
:::

:::image at=right-half offsetX=50 src=https://cdn.aha/chart.png alt="Q4 chart"
:::
```

### 3.2 Block types in v1

Only **three** types — keep the surface tiny:

| Type | What it is | Notable attrs |
|---|---|---|
| `text` | Heading, paragraph, list, quote — distinguished by Markdown inside body + `preset` | `preset`, `align`, `color`, `fontFamily`, `fontSize` |
| `image` | Bitmap or SVG | `src`, `alt`, `fit=contain\|cover\|fill` |
| `shape` | Rect, circle, line, arrow | `kind`, `fill`, `stroke`, `strokeWidth`, `borderRadius` |

There is **no** separate `title` / `bullets` / `paragraph` block type. Markdown inside `text` + `preset` covers it.

### 3.3 TypeScript types

```ts
type Anchor =
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right'
  | 'left-half' | 'right-half' | 'top-half' | 'bottom-half'
  | 'full';

interface Position {
  // Mode A: anchored (preferred)
  anchor?: Anchor;
  width?: number | string;     // px ("520") or percent ("60%") — overrides anchor default
  height?: number | string;
  offsetX?: number;            // px delta from anchor's resolved x (default 0)
  offsetY?: number;            // px delta from anchor's resolved y

  // Mode B: pixel-pinned (when geometry is the design)
  x?: number;
  y?: number;
  w?: number;
  h?: number;

  rotation?: number;           // degrees, default 0
  zIndex?: number;             // computed from file order; explicit override allowed
}

interface BlockBase {
  id: string;                  // nanoid; stable across edits
  position: Position;
}

interface TextBlock extends BlockBase {
  type: 'text';
  markdown: string;            // body content
  preset?: 'title' | 'body' | 'caption' | 'quote';
  align?: 'left' | 'center' | 'right' | 'justify';
  color?: string;              // hex, theme keyword ('auto'|'primary'|'secondary'|'muted')
  fontFamily?: string;         // theme keyword or family
  fontSize?: number;           // px override
}

interface ImageBlock extends BlockBase {
  type: 'image';
  src: string;
  alt?: string;
  fit?: 'contain' | 'cover' | 'fill';
}

interface ShapeBlock extends BlockBase {
  type: 'shape';
  kind: 'rect' | 'circle' | 'line' | 'arrow';
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  borderRadius?: number;
}

type Block = TextBlock | ImageBlock | ShapeBlock;

interface SlideDoc {
  canvas: { width: 1280; height: 720 };
  version: 1;
  blocks: Block[];
}
```

### 3.4 Storage layer (host slide attributes)

| Key | Value | Purpose |
|---|---|---|
| `dsl` | The DSL text (string) | Source of truth |
| `dslVersion` | `1` (number) | Schema version, for future migration |

That's the entire persistence surface. **No sidecar JSON.** On load: parse DSL → `SlideDoc`. On save: serialize `SlideDoc` → DSL → set attribute.

The DSL is forward-compatible: unknown attrs are preserved verbatim during round-trip so v2-only fields don't get dropped by v1 clients.

### 3.5 Why MyST-flavored over alternatives

- vs. **pure JSON**: way more LLM-friendly; humans can debug it; markdown bodies look natural.
- vs. **YAML-only**: ugly position attrs; markdown bodies don't fit cleanly.
- vs. **Nuemark `[.tag]`**: looser grammar; no obvious place for arbitrary attrs.
- vs. **HTML/JSX**: too verbose, escaping pain for LLMs.

The triple-colon fence (`:::`) is unambiguous against Markdown content; attrs as `key=value` are produced reliably by LLMs; body is plain Markdown.

---

## 4. Anchor catalog + resolution math

### 4.1 v1 catalog: 14 anchors, two flavors

**Region anchors (5)** — set BOTH position AND size:
- `full` — full-bleed; ignores safe-area (use for backgrounds).
- `left-half`, `right-half` — vertical split.
- `top-half`, `bottom-half` — horizontal split.

**Point anchors (9)** — set alignment point; block sizes to content (or `width`/`height` override):
- `top-left`, `top-center`, `top-right`
- `center-left`, `center`, `center-right`
- `bottom-left`, `bottom-center`, `bottom-right`

### 4.2 Safe-area = 6%

`PAD_X = 76px` (6% of 1280), `PAD_Y = 43px` (6% of 720). All non-`full` anchors inset by this. `full` ignores it.

### 4.3 Resolution algorithm

```ts
function resolveAnchor(block: Block, canvas: { width: 1280; height: 720 }): Rect {
  // Pixel-pinned short-circuit
  if (block.position.x !== undefined) {
    return { x: block.position.x, y: block.position.y, w: block.position.w, h: block.position.h };
  }

  const { anchor, width, height, offsetX = 0, offsetY = 0 } = block.position;
  const PAD_X = canvas.width * 0.06;
  const PAD_Y = canvas.height * 0.06;

  // Width/height: explicit override > region default > content auto-size
  let w = parseDim(width, canvas.width)  ?? regionDefault(anchor)?.w ?? naturalSize(block).w;
  let h = parseDim(height, canvas.height) ?? regionDefault(anchor)?.h ?? naturalSize(block).h;

  const { x, y } = computePosition(anchor, canvas, w, h, PAD_X, PAD_Y);

  return { x: x + offsetX, y: y + offsetY, w, h };
}

function parseDim(d: number | string | undefined, total: number): number | null {
  if (d === undefined) return null;
  if (typeof d === 'number') return d;
  if (d.endsWith('%')) return total * (parseFloat(d) / 100);
  return parseFloat(d);
}
```

### 4.4 Resolution table (canvas 1280×720, safe-area 76px / 43px)

| Anchor | Type | Default rect (x, y, w, h) |
|---|---|---|
| `full` | region | (0, 0, 1280, 720) |
| `left-half` | region | (76, 43, 564, 634) |
| `right-half` | region | (640, 43, 564, 634) |
| `top-half` | region | (76, 43, 1128, 317) |
| `bottom-half` | region | (76, 360, 1128, 317) |
| `top-left` | point | (76, 43, auto, auto) |
| `top-center` | point | (640−w/2, 43, auto, auto) |
| `top-right` | point | (1204−w, 43, auto, auto) |
| `center-left` | point | (76, 360−h/2, auto, auto) |
| `center` | point | (640−w/2, 360−h/2, auto, auto) |
| `center-right` | point | (1204−w, 360−h/2, auto, auto) |
| `bottom-left` | point | (76, 677−h, auto, auto) |
| `bottom-center` | point | (640−w/2, 677−h, auto, auto) |
| `bottom-right` | point | (1204−w, 677−h, auto, auto) |

`auto` means: text auto-sizes to content; image inherits natural ratio; shape requires explicit `w`/`h`.

**Rotation is not part of the resolved rect.** The resolver returns `{ x, y, w, h }`. Rotation is applied separately by the renderer as a CSS `transform: rotate()` around the block's center.

### 4.5 Width/height units

| Form | Meaning |
|---|---|
| `width=520` | 520px |
| `width=60%` | 60% of canvas width (768px) |
| `width=auto` (omitted) | Content-determined for text/image, error for shape |

---

## 5. Editor UX

### 5.1 Canvas (Canvas.tsx) — direct manipulation

**Selection**
- Click block → select; click empty → deselect.
- Shift+click → toggle in multi-select.
- Marquee drag from empty space → rectangle multi-select.
- Cmd/Ctrl+A → select all; Esc → deselect.

**Drag**
- Drag selected block(s) → move.
- **Snap** to 8px grid when ≤4px from a grid line.
- **8px-multiple invariant**: stored x/y/w/h/offsetX/offsetY/width/height pixel values are always multiples of 8. Held by snap during drag and by serialization rounding on save (regardless of input).
- **Smart guides** (dashed pink) appear when edges/centers align with another block or canvas center.
- **Anchor auto-swap**: dragging into a different anchor zone (closest within 60px of cursor) highlights it; on drop, `anchor` swaps and `offsetX/Y` clears.
- **Pixel pin** is an explicit toggle in Settings, not a drag side-effect — drag always uses anchor+offset unless block is already pinned.
- Shift = lock to H/V axis; Alt = duplicate while dragging.

**Resize**
- 8 handles per selected block (4 corner + 4 edge).
- Shift = lock aspect ratio; Alt = resize from center.
- Updates `width`/`height` (anchored) or `w`/`h` (pinned). Snap rules apply.

**Rotate**
- One handle above the block (curved arrow icon).
- Shift snaps to 15° increments.

**Inline rich text** (Tiptap, only for `text` blocks)
- Double-click or Enter → enter edit mode; floating toolbar appears above block (B / I / U / S / link / `-` list / `1.` list / `>` quote / ⋯).
- Markdown shortcuts auto-convert (`**bold**`, `# H1`, `- item`).
- Esc or click outside → exit; serialize back to Markdown in DSL.

**Keyboard shortcuts**

| Key | Action |
|---|---|
| ←↑→↓ | Nudge 1px |
| Shift+←↑→↓ | Nudge 10px |
| Delete / Backspace | Delete block |
| Cmd/Ctrl+D | Duplicate |
| Cmd/Ctrl+Z / Cmd/Ctrl+Shift+Z | Undo / redo |
| Cmd/Ctrl+] / [ | Bring forward / send back |
| Cmd/Ctrl+Shift+] / [ | Bring to front / send to back |
| Enter | Enter text edit mode |
| Esc | Exit edit mode / deselect |

### 5.2 Settings panel (Settings.tsx) — three sections

**1. Insert** (always at top)
- 4 buttons: `+ Text` / `+ Bullets` / `+ Image` / `+ Shape ▾` (dropdown: rect/circle/line/arrow).
- `+ Bullets` = `+ Text` with body prefilled `- ` and `preset=body`.
- New block lands at canvas `center` anchor, selected.

**2. Properties** (visible only when ≥1 block selected)
- **Layout**: Anchor picker (visual 3×3 + halves + full = 14 cells), `width`, `height`, `offsetX`, `offsetY` (anchored), `x/y/w/h` (pinned), `rotation`, `Pin to position` toggle.
- **Style** (varies by block type): preset/align/color/font/fontSize for text; src/alt/fit/opacity/borderRadius for image; kind/fill/stroke/strokeWidth/borderRadius/opacity for shape.
- **Layer**: z-index up/down arrows.

**3. AI Generate** (always at bottom)
- Textarea: "Describe the slide…".
- `Generate` button — sends prompt + current DSL + theme to LLM.
- Two modes: **Create** (empty slide) / **Iterate** (existing slide → refine).
- Last 3 prompts as reusable chips.
- See §6 for the full LLM contract.

**Empty selection state:** Properties section replaced by "Slide settings" (canvas background swatch — defaults to theme palette). Insert and AI Generate stay visible.

### 5.3 CanvasModal.tsx — fullscreen edit

- Same `<SlideEditor>` mounted at full viewport.
- Triggered by `↔` Expand button at top-right of canvas.
- Settings panel slides in from right.
- Esc to exit.

### 5.4 Audience.tsx / AudienceModal.tsx — read-only render

- `<SlideRenderer mode="play">`: no handles, no selection, no Tiptap edit, no smart guides.
- Markdown bodies render to semantic HTML (`<h1>`, `<h2>`, `<p>`, `<ul>`, `<blockquote>`, `<strong>`, `<em>`) for screen readers.
- Theme palette applied (colors, fonts).
- No interaction (this is a content slide; no submission, no live counts).

---

## 6. LLM integration

### 6.1 Authoring contract: direct DSL emission

LLM emits the **full DSL as text** in one shot — not structured tool calls.

- Single parse, single render — fewer moving parts.
- Markdown bodies are natural to write; structuring as tool-call args adds noise.
- Token-efficient (~500–800 output tokens per slide).
- The DSL is already the source of truth — having LLM author it directly removes a layer.

For **v2** we'd consider per-block tool calls (`updateBlockMarkdown`, `nudgeBlock`) for fine-grained iteration; v1 doesn't need that.

### 6.2 Two flows

| Flow | Trigger | Input | Output |
|---|---|---|---|
| **Create** | User clicks Generate on empty slide | `prompt`, `theme`, `canvasSize` | full DSL |
| **Iterate** | User clicks Generate when slide has content | `prompt`, `currentDsl`, `theme` | full DSL (replacement) |

Iterate mode adds: *"if a block has `x/y/w/h` instead of `at`, the user pinned it on purpose — keep those coordinates unless explicitly asked to move it."* Same for `offsetX/Y`. This preserves user nudges through regenerations.

### 6.3 System prompt structure

Lives at `core/llm/system-prompt.md` (plugin-owned, not embedded in backend code). Sections:

1. **Mission** — "You are authoring a content slide for AhaSlides. Output only the DSL, no commentary."
2. **DSL syntax** — frontmatter + `:::type attrs ::: ` blocks + Markdown bodies.
3. **Anchor catalog** — the 14 anchors with one-line use cases.
4. **Block types** — text / image / shape attrs.
5. **Layout patterns** — 6 named recipes ("hero", "title+bullets", "title+bullets+image", "two-column compare", "headline+stat", "image full-bleed with caption").
6. **Hard rules**:
   - Canvas is exactly 1280×720; nothing extends past edges.
   - Pixel coords must be multiples of 8.
   - Max 8 blocks per slide.
   - No two blocks may overlap by more than 80% intersection.
   - Font sizes: title 28–48px, body 13–18px, caption 10–12px.
   - Prefer `color=auto` (theme-driven); use hex only for emphasis.
7. **Few-shot examples** — 3 prompt → DSL pairs (the slides mocked during design: hero, headline+bullets+chart, before/after).

Total ~2–3K tokens. Cached aggressively (Anthropic prompt cache TTL 5+ min).

### 6.4 Where the LLM call happens

Plugin has no backend Worker. Generate calls a **host-provided endpoint**:

```
POST /api/v1/slide-plugin/content/generate
{ prompt, currentDsl?, theme, mode: 'create' | 'iterate' }
→ { dsl: string }
```

This endpoint lives in **General API** (existing Express service). General API in turn calls **Aha AI** (Django + Groq/OpenAI) for the actual LLM call, passing our `system-prompt.md`. Same model selection logic Aha AI already uses (Groq primary, OpenAI fallback).

The plugin ships the system prompt as a static asset bundled with the FE build. General API loads it at startup from a known URL (the plugin's deployed asset bundle). When the plugin releases a new version with a changed prompt, General API redeploys to pick it up. (For v1, the prompt change cadence is low — weekly at most — so startup-load is acceptable. v2 may revisit.)

**This requires coordination with the host team** — not just plugin work. See §8 for the milestone where this lands.

### 6.5 Validator + repair (browser-side)

Lives in `core/repair/`. Pipeline after LLM returns DSL:

```ts
const result = parse(dsl);                     // syntax errors → 1 retry
const validated = validateSchema(result);      // required fields, valid enums
const repaired = repairGeometry(validated, {
  canvas: { width: 1280, height: 720 },
  snapTo: 8,
  maxOverlap: 0.8,
});
return repaired.doc;
```

**Repairs auto-applied:**
- Block extends past canvas → clip with margin.
- Coords not multiples of 8 → round.
- Two blocks overlapping >80% → nudge later one by 16px iteratively (max 5 iterations); accept whatever overlap remains after.
- Invalid `preset`/`anchor`/`kind` → fall back to defaults (`body`, `center`, `rect`).
- Unknown attrs → preserved verbatim (forward-compat).

**Unrepairable** (parse fails twice, or geometry can't be auto-fixed) → inline error in Settings panel: *"Couldn't generate slide. Try a more specific prompt."* The DSL on disk isn't touched.

### 6.6 Slides Agent integration (specified, not built in v1)

Plugin exposes its generation contract via a manifest:

```json
{
  "slideType": "content",
  "version": 1,
  "generator": {
    "endpoint": "/api/v1/slide-plugin/content/generate",
    "systemPromptPath": "@aha-external/content-frontend/llm/system-prompt.md",
    "inputs": ["prompt", "currentDsl?", "theme", "canvasSize"]
  }
}
```

The Slides Agent (in `aha-chatbot-agent`) calls this endpoint when a presentation includes a content slide. Result is set as the slide's `dsl` attribute via existing slide-update APIs. **Wiring the agent is a separate workstream by the chatbot team** — our plugin's responsibility is publishing the contract and the system prompt.

### 6.7 Settings panel UX

- Generate button → spinner; cancellable.
- Success → DSL replaces in canvas (anchored blocks animate to new positions; pinned blocks visually stay if untouched).
- Error → inline message under textarea, retry button.
- Cmd/Ctrl+Z immediately after generate → reverts.
- Last 3 prompts as reusable chips.

---

## 7. Audience playback + theming

### 7.1 Audience render (Audience.tsx / AudienceModal.tsx)

`<SlideRenderer mode="play">` — same component as Canvas but with all editor affordances disabled:
- No handles, selection rings, or Tiptap edit mode.
- No smart guides, no toolbar.
- Pure read-only.

Markdown bodies render to semantic HTML so screen readers work:
- `# H1` / `## H2` / `### H3` → `<h1>` / `<h2>` / `<h3>` (h4–h6 supported but uncommon in slides)
- paragraph → `<p>`
- `- item` → `<ul><li>`
- `1. item` → `<ol><li>`
- `> quote` → `<blockquote>`
- `**bold**` → `<strong>`
- `*italic*` → `<em>`
- `` `code` `` → `<code>` (inline only — no fenced code blocks in v1)
- `[text](url)` → `<a>` with `target="_blank"` and `rel="noopener"`

### 7.2 Theming

AhaSlides has presentation-level themes: color palette + font family.

Plugin reads from `xprops.presentationProps`:
- `colorPalette`, `lighterColorPalette` — accent colors
- `fontFamily` — body font
- `textColour` — primary text color
- `language` — for locale (RTL support deferred to v2)

**Color resolution:**

```ts
function resolveColor(value: string | undefined, theme: Theme): string {
  if (!value || value === 'auto')   return theme.text.primary;
  if (value === 'primary')          return theme.accent.primary;
  if (value === 'secondary')        return theme.accent.secondary;
  if (value === 'muted')            return theme.text.muted;
  if (value.startsWith('#'))        return value;
  return theme.text.primary;        // fallback
}
```

**Preset → typography:**

| Preset | Default size (px) | Default weight |
|---|---|---|
| `title` | 36 | 800 |
| `body` | 14 | 400 |
| `caption` | 11 | 500 |
| `quote` | 18 | 400 italic |

Per-block `fontSize`/`fontFamily`/`color` overrides win. Themes from the host override defaults next. Preset is the floor.

### 7.3 Responsive scaling

Slide design space is always 1280×720. Audience.tsx renders into a 1280×720 frame, then `transform: scale(scaleFactor)` to fill the viewport, where:

```ts
scaleFactor = Math.min(viewportWidth / 1280, viewportHeight / 720);
```

Centered horizontally and vertically. Letterboxes appear if aspect ratios mismatch.

---

## 8. Risks, testing, milestones, out-of-scope

### 8.1 Risks

1. **DSL grammar ambiguity**. Markdown-in-body + colon fences have edge cases (e.g., a Markdown line `:::` inside a body). Mitigation: hand-rolled parser ~150 LOC with fixture tests; `:::` is a hard fence (no in-body escaping needed because line must start at column 0 and have nothing else).
2. **Anchor + offset round-trip drift**. User drags 100px → serialize → parse → render must produce identical pixels. Mitigation: snapshot tests for round-trip identity on randomized SlideDocs.
3. **LLM compliance**. Even with system prompt, expect 5–10% bad output. Mitigation: validator + repair pipeline + 1 retry on parse failure.
4. **`@aha/ui-vanilla` versioning**. New sync API is additive only (minor bump 1.0.8 → 1.1.0). Risk of consumer-side type drift; mitigation: snapshot test of public API surface.
5. **React in a Vue plugin group**. Future maintainers unfamiliar with React. Mitigation: README in `content/frontend/` explaining the choice.
6. **Audience perf with many slides.** 100+ slides × 8 blocks = 800 elements. Mitigation: only render active slide; lazy-mount others (host already does this for non-content slide types).

### 8.2 Testing strategy

- **Unit (Vitest)** in `core/`:
  - DSL parser → 30+ fixture tests (happy path, edge cases, malformed).
  - Anchor resolver → 14 anchors × 4 width/height combos = 50+ tests.
  - Repair pipeline → each repair rule tested.
  - Round-trip identity → randomized `SlideDoc` → DSL → `SlideDoc` → DSL stable.
- **Component (Vitest + Testing Library)**:
  - SlideEditor select / drag / resize / rotate.
  - Multi-select + group ops.
  - Tiptap inline edit serializes correctly.
  - Settings panel anchor picker / pin toggle.
- **E2E (Playwright)** in `tests/`:
  - Create new content slide.
  - Add text/image/shape blocks.
  - Drag, resize, rotate.
  - Generate via AI prompt (mock LLM endpoint).
  - Audience renders correctly.
  - CanvasModal fullscreen edit.

### 8.3 Milestones (single engineer)

| # | Weeks | Deliverable |
|---|---|---|
| M1 | 1–2 | Plugin scaffold, package.json, router. Core engine: types, DSL parser, anchor resolver, validator. Vitest setup + parser tests. **`@aha/ui-vanilla` sync promotion lands here.** |
| M2 | 3–4 | `<SlideRenderer>` (read-only). Hardcoded test slide renders end-to-end. Audience mode works. |
| M3 | 5–6 | `<SlideEditor>` with select/drag (no resize/rotate yet). Settings panel skeleton. AnchorPicker. |
| M4 | 7–8 | Resize, rotate, snap, smart guides. Multi-select. Keyboard shortcuts. |
| M5 | 9–10 | Tiptap inline rich text. Insert blocks UX. Properties panel. |
| M6 | 11 | AI Generate UI in Settings. System prompt drafted. Validator+repair wired. Mock LLM endpoint for testing. **General API endpoint coordinated with host team — wiring begins this milestone.** |
| M7 | 12 | Polish. E2E tests. Docs. Beta flag. |
| M8 | 13 | Bug bash. Internal beta. |

~3 months for v1. v2/v3 ("PowerPoint and beyond") is a future series — tables, charts, animations, slide masters, real-time collab, etc.

### 8.4 Explicitly out of v1 scope

- Backend Cloudflare Worker for the plugin.
- Migration of existing TinyMCE content slides.
- Real-time collaborative editing.
- Animations / transitions.
- Tables, charts (as block types), embedded video, audio.
- Slide masters / shared theme overrides per slide.
- Speaker notes.
- Image generation by LLM (only references to user-uploaded or stock images).
- Multi-slide deck generation in plugin (Slides Agent's job).
- Streaming LLM output.
- Lock/hide block toggles.
- Component reuse across slides.
- RTL language support in Tiptap (defer to v2).
- The `@aha/ui` (Vue) → `@aha/ui-vanilla` delegation refactor (separate PR by host team).

### 8.5 Dependencies on other teams

| What | Who | Blocks which milestone |
|---|---|---|
| `POST /api/v1/slide-plugin/content/generate` endpoint in General API | Host backend team | M6 |
| Aha AI handler for content-slide LLM call | Aha AI team | M6 |
| Slides Agent integration (chatbot calls our endpoint) | Chatbot team | post-v1 |
| Acceptance of `@aha/ui-vanilla` 1.1.0 release | SDK maintainer | M1 |

The plugin team can ship M1–M5 independently. M6 requires host coordination; M7+ requires real LLM endpoint.
