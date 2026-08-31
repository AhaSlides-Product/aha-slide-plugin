import { computed, watch, watchEffect, type Ref } from 'vue';
import { ahaSlidesDefaultTheme } from '@aha/ui';

const DEFAULT_TEXT_COLOUR = '#313131';
const FALLBACK_FONT = 'Plus Jakarta Sans';

/** Load a Google font into THIS document (each iframe needs its own call). */
function loadGoogleFont(fontFamily: string): void {
  if (!fontFamily || fontFamily === FALLBACK_FONT) return;
  const id = `gfont-${fontFamily.replace(/\s+/g, '-')}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    fontFamily,
  )}:ital,wght@0,400;0,600;1,400;1,600&display=swap`;
  document.head.appendChild(link);
}

/** Relative luminance of a #RRGGBB / #RGB colour, 0 (black) … 1 (white). */
function luminance(hex: string): number {
  const normalised = hex.replace('#', '');
  const full =
    normalised.length === 3
      ? normalised.split('').map((c) => c + c).join('')
      : normalised;
  const int = parseInt(full, 16);
  if (Number.isNaN(int) || full.length !== 6) return 1;
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/** Readable ink (near-white or near-black) for text on a given fill. */
export function readableInk(background: string): string {
  return luminance(background) > 0.55 ? DEFAULT_TEXT_COLOUR : '#FFFFFF';
}

interface ThemeSources {
  fontFamily: Ref<string | undefined>;
  textColour: Ref<string | undefined>;
  palette: Ref<string[] | undefined>;
  lighterPalette: Ref<string[] | undefined>;
}

/**
 * Derive the deck-native theme tokens both iframes render with, load the deck
 * font into the current document, and publish them as `--pg-*` CSS variables.
 * `themeReady` gates colour-bearing UI so nothing flashes a fallback hue during
 * the zoid handshake.
 */
export function useTheme(sources: ThemeSources) {
  const fontFamily = computed(
    () => sources.fontFamily.value || ahaSlidesDefaultTheme.token?.fontFamily || FALLBACK_FONT,
  );
  const textColour = computed(() => sources.textColour.value || DEFAULT_TEXT_COLOUR);
  const accent = computed(() => sources.palette.value?.[0] || ahaSlidesDefaultTheme.token?.colorPrimary || '#7C4DFF');
  const accentLighter = computed(() => sources.lighterPalette.value?.[0] || accent.value);
  const themeReady = computed(
    () => !!sources.textColour.value && (sources.palette.value?.length ?? 0) > 0,
  );

  watch(fontFamily, (font) => loadGoogleFont(font), { immediate: true });

  watchEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--pg-text', textColour.value);
    root.style.setProperty('--pg-accent', accent.value);
    root.style.setProperty('--pg-accent-lighter', accentLighter.value);
    root.style.setProperty('--pg-accent-ink', readableInk(accent.value));
    root.style.setProperty('--pg-font', fontFamily.value);
    root.style.setProperty('--pg-border', 'color-mix(in srgb, currentColor 10%, transparent)');
  });

  const theme = computed(() => ({
    ...ahaSlidesDefaultTheme,
    token: { ...ahaSlidesDefaultTheme.token, fontFamily: fontFamily.value },
  }));

  return { fontFamily, textColour, accent, accentLighter, themeReady, theme };
}
