import { ref, type App } from 'vue';
import en from './locales/en.json';

type Messages = Record<string, string>;

/**
 * Minimal i18n for the plugin — enough to route every user-visible string
 * through `t(key, params)` with `{name}` interpolation, without pulling a
 * runtime dependency. V1 ships English only; other languages fall back to it.
 */
const bundles: Record<string, Messages> = { en };
const locale = ref('en');

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name) =>
    name in params ? String(params[name]) : match,
  );
}

export function t(key: string, params?: Record<string, string | number>): string {
  const bundle: Messages = bundles[locale.value] ?? en;
  return interpolate(bundle[key] ?? (en as Messages)[key] ?? key, params);
}

/** Point the UI at the presentation's language when a bundle exists for it. */
export function syncLocale(language?: string): void {
  if (language && bundles[language]) locale.value = language;
}

/** Composable mirroring vue-i18n's surface so components read naturally. */
export function useI18n() {
  return { t, locale };
}

export default {
  install(app: App) {
    app.config.globalProperties.$t = t;
  },
};
