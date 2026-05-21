/**
 * Host-font auto-loader for slide-plugin iframes.
 *
 * Each plugin renders inside a cross-origin iframe, so it does NOT inherit
 * the host's `@font-face` declarations — only the `--aha-fontFamily` CSS
 * variable string. Without a `<link>` to the actual typeface inside the
 * iframe document, the browser silently falls back to a generic family
 * even though DevTools shows the family name set correctly.
 *
 * This module reads `window.xprops.presentation.fontFamily` (populated by
 * zoid once the host bridge is ready), then injects the matching Google
 * Fonts stylesheet into the iframe's `<head>`. Idempotent — repeated calls
 * with the same family are no-ops; family changes update the same link.
 *
 * Adapted from the per-plugin `useHostFont` hook used by the diagram app.
 * Lifted into shared package so every plugin (existing and future) inherits
 * the behaviour by calling `installHostFontAutoLoad()` once at startup.
 */

const LINK_ID = 'aha-host-font';
const DEFAULT_FAMILY = 'Plus Jakarta Sans';
const SYSTEM_FONT_RE =
  /^(?:serif|sans-serif|monospace|system-ui|-apple-system|BlinkMacSystemFont|inherit|initial|unset)$/i;

interface XPropsLike {
  presentation?: { fontFamily?: string };
}

function readXPropsFontFamily(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const xprops = (window as { xprops?: XPropsLike }).xprops;
  return xprops?.presentation?.fontFamily;
}

function readCssVarFamily(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--aha-fontFamily')
    .trim();
  return raw || undefined;
}

function primaryFamily(stack: string): string {
  return stack.replace(/['"]/g, '').split(',')[0]?.trim() ?? '';
}

/**
 * Inject (or update) the Google Fonts `<link>` for the given primary family.
 * No-op for system / generic families and when `document` is unavailable.
 */
function injectFontLink(family: string): void {
  if (typeof document === 'undefined') return;
  if (!family || SYSTEM_FONT_RE.test(family)) return;

  // Axes intentionally mirror `stpancras-presenter-app/public/index.html`'s
  // Plus Jakarta Sans link so the iframe loads the exact same weight set as
  // the host UI (400/600 + italic). Add weights here only if the presenter
  // adds them too — otherwise the iframe diverges from the host typeface.
  const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    family,
  )}:ital,wght@0,400;0,600;1,400;1,600&display=swap`;

  const existing = document.getElementById(LINK_ID) as HTMLLinkElement | null;
  if (existing && existing.href === href) return;
  if (existing) {
    existing.href = href;
    return;
  }
  const link = document.createElement('link');
  link.id = LINK_ID;
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

/**
 * One-shot font load: resolves the primary family from
 * (1) `window.xprops.presentation.fontFamily`,
 * (2) the `--aha-fontFamily` CSS variable on `:root`,
 * (3) `Plus Jakarta Sans` as the AhaSlides default,
 * and ensures the matching Google Fonts stylesheet is in the document head.
 *
 * Also sets `--aha-fontFamily` to the resolved stack so any CSS that reads
 * the variable lands on the same family even before the host paints it.
 */
export function ensureHostFontLoaded(explicitStack?: string): string {
  const stack = explicitStack || readXPropsFontFamily() || readCssVarFamily() || DEFAULT_FAMILY;
  const family = primaryFamily(stack);
  injectFontLink(family);
  if (typeof document !== 'undefined' && family) {
    document.documentElement.style.setProperty('--aha-fontFamily', `'${family}', sans-serif`);
  }
  return family;
}

let installed = false;
let lastFamily: string | undefined;

/**
 * Idempotently install a watcher that keeps the iframe's loaded font in
 * sync with `xprops.presentation.fontFamily`. Plugins call this once from
 * their main entry; the host's prop updates are picked up on a short poll.
 *
 * @param options.intervalMs polling interval in ms (default `500`)
 * @param options.defaultFamily fallback family when xprops/CSS var are empty
 *                              (default `'Plus Jakarta Sans'`)
 */
export function installHostFontAutoLoad(options?: {
  intervalMs?: number;
  defaultFamily?: string;
}): void {
  if (typeof window === 'undefined' || installed) return;
  installed = true;

  const intervalMs = options?.intervalMs ?? 500;
  const fallback = options?.defaultFamily ?? DEFAULT_FAMILY;

  const tick = () => {
    const stack = readXPropsFontFamily() || readCssVarFamily() || fallback;
    const family = primaryFamily(stack);
    if (!family || family === lastFamily) return;
    lastFamily = family;
    injectFontLink(family);
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--aha-fontFamily', `'${family}', sans-serif`);
    }
  };

  // Seed immediately (covers the case where xprops is already populated
  // OR the host hasn't connected yet — we'll still load the default).
  tick();
  window.setInterval(tick, intervalMs);
}
