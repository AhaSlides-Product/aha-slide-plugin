import type { ThemeConfig } from 'ant-design-vue/es/config-provider/context';
import SeedTokens from './ant-design-tokens/seed-tokens.js';
import MapTokens from './ant-design-tokens/map-tokens.js';
import { theme } from 'ant-design-vue';

// Extract colors from Tailwind config


/**
 * Base theme configuration for Aha Slide applications using Ant Design.
 * Colors are sourced from the Tailwind config to maintain design consistency.
 * 
 * NOTE: This theme uses a subset of available Ant Design Vue tokens.
 * See comments below for tokens that could be mapped from Tailwind config.
 */
export const ahaSlidesTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    ...SeedTokens,
    ...MapTokens,
  },
};
