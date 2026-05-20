import SeedTokens from './seed-tokens.js';
import MapTokens from './map-tokens.js';
import AliasTokens from './alias-tokens.js';
import CustomColors from './custom-colors.js';

const antDesignTokens = {
  ...SeedTokens,
  ...MapTokens,
  ...AliasTokens,
};

export { SeedTokens, MapTokens, AliasTokens, CustomColors, antDesignTokens };
export default antDesignTokens;
