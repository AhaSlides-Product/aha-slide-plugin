import tailwindConfig from '../tailwind.config.js';

/**
 * Tailwind color palette from the shared UI configuration.
 * Use these colors to maintain design consistency across the application.
 * 
 * @example
 * ```typescript
 * import { tailwindColors } from '@aha/ui';
 * 
 * const primaryColor = tailwindColors.purple[60]; // #6A1EBB
 * const successColor = tailwindColors.emerald[60]; // #16C49A
 * ```
 */
export const tailwindColors = tailwindConfig.theme.colors;

