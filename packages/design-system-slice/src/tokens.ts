import { SeedTokens, MapTokens, AliasTokens } from '@aha/design';

/**
 * The antd design-token object both framework tiers theme themselves with.
 * One object, fed to antd v6 `ConfigProvider` (React) and ant-design-vue v4
 * `ConfigProvider` (Vue), so a single @aha/design change re-themes both tiers.
 */
export const themeToken = {
  ...SeedTokens,
  ...MapTokens,
  ...AliasTokens,
} as const;

export const themeConfig = {
  token: themeToken,
} as const;

export type ThemeToken = typeof themeToken;
