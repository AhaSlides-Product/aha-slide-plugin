/**
 * Host-font auto-loader for slide-plugin iframes.
 *
 * Cross-origin iframes do NOT inherit `@font-face` declarations from the
 * host — only the `--aha-fontFamily` CSS variable. So even when DevTools
 * shows the family name set correctly, the browser silently falls back
 * to a generic family unless somebody on the iframe side loads the
 * matching typeface. This module reads
 * `window.xprops.presentation.fontFamily` and injects the matching Google
 * Fonts stylesheet into the iframe's `<head>`. Idempotent; updates when
 * the host swaps font families.
 */

const LINK_ID = 'aha-host-font';
const DEFAULT_FAMILY = 'Plus Jakarta Sans';

// Generic family names + common system fonts that won't be found on
// Google Fonts — skip the network call. The list is intentionally
// non-exhaustive: anything not matched here that also isn't on Google
// Fonts will just trigger a harmless empty CSS response.
const SYSTEM_FONT_RE =
  /^(?:serif|sans-serif|monospace|system-ui|-apple-system|BlinkMacSystemFont|inherit|initial|unset|Arial|Helvetica|Helvetica Neue|Times New Roman|Times|Courier New|Courier|Verdana|Tahoma|Georgia|Trebuchet MS)$/i;

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

  // Weights cover the common roles AhaSlides plugins need: regular (400),
  // semibold (600), bold (700), and italic for each. This is intentionally
  // broader than presenter-app/public/index.html's Plus-Jakarta-Sans link
  // (which omits 700) because the shared loader serves ANY family the
  // host may send via xprops — and on fonts like Roboto / Lato / Source
  // Sans, native bold is 700 not 600. Modest extra bandwidth (~30 KB) for
  // predictable bold rendering across the catalog.
  const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    family,
  )}:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&display=swap`;

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

// Module-scope watcher state. Encapsulated so the install function can
// be called repeatedly and so callers (HMR, tests) can tear it down
// explicitly via the returned cleanup. See _resetHostFontAutoLoadForTesting
// for the test-only escape hatch.
let intervalId: number | null = null;
let lastFamily: string | undefined;

/**
 * Idempotently install a watcher that keeps the iframe's loaded font in
 * sync with `xprops.presentation.fontFamily`. Plugins call this once from
 * their main entry; the host's prop updates are picked up on a short poll.
 *
 * Returns a cleanup function that stops the poll and clears module state.
 * Important for HMR (avoid stacked intervals from re-mounted modules) and
 * unit tests. The cleanup is safe to call multiple times; subsequent calls
 * are no-ops. Calling install while already installed returns a no-op
 * cleanup — first call wins; the original cleanup is what actually tears
 * the watcher down.
 *
 * @param options.intervalMs polling interval in ms (default `500`)
 * @param options.defaultFamily fallback family when xprops/CSS var are empty
 *                              (default `'Plus Jakarta Sans'`)
 */
export function installHostFontAutoLoad(options?: {
  intervalMs?: number;
  defaultFamily?: string;
}): () => void {
  if (typeof window === 'undefined') return () => {};
  if (intervalId !== null) {
    // Already running — return a no-op cleanup so callers can blindly
    // chain `.then(cleanup => …)` without accidentally tearing down the
    // first installer's watcher.
    return () => {};
  }

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
  const myId = window.setInterval(tick, intervalMs);
  intervalId = myId;

  // Closure over `myId` ensures the cleanup only clears the interval it
  // spawned, not whatever interval happens to be active when it's called
  // (in case the module was reset between install and cleanup).
  return () => {
    if (intervalId === myId && typeof window !== 'undefined') {
      window.clearInterval(myId);
      intervalId = null;
      lastFamily = undefined;
    }
  };
}

/**
 * Test-only reset hook. Unit tests with disabled module isolation can call
 * this between cases to drop the module-scope watcher + cached family so a
 * subsequent `installHostFontAutoLoad()` runs as if from scratch. Not part
 * of the public API for production callers — use the cleanup returned by
 * `installHostFontAutoLoad` instead.
 */
export function _resetHostFontAutoLoadForTesting(): void {
  if (intervalId !== null && typeof window !== 'undefined') {
    window.clearInterval(intervalId);
  }
  intervalId = null;
  lastFamily = undefined;
}
