import SeedTokens from './seed-tokens.js';
import MapTokens from './map-tokens.js';
import AliasTokens from './alias-tokens.js';

const antDesignTokens = {
  ...SeedTokens,
  ...MapTokens,
  ...AliasTokens,
};

export { SeedTokens, MapTokens, AliasTokens, antDesignTokens };
export default antDesignTokens;
