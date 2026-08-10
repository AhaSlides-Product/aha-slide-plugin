/**
 * Barrel — the only import surface specs use for Page Objects.
 *
 * Specs import `{ HomePage } from '@pages'`, never a deep relative path. Moving or
 * renaming a page-object file then touches this file only, not every spec.
 */
export { BasePage } from './base.page';
export { HomePage } from './home.page';
