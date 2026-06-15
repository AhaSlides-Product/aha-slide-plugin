import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { theme } from 'ant-design-vue';
import antDesignTokens, { CustomColors } from '@aha/design';

// Ant Design preset palette names — dropped from output (including shades like blue1..blue10)
const PRESET_COLOR_RE = /^(blue|purple|cyan|green|magenta|pink|red|orange|yellow|volcano|geekblue|gold|lime)(-?\d+)?$/;

// Get current directory (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Define your theme (The same one you'd put in ConfigProvider)
const ahaSlidesDefaultTheme = {
  token: antDesignTokens,
};

// 2. Use the internal algorithm to get ALL tokens
// Note: defaultAlgorithm is used here, you could use darkAlgorithm too
const { defaultAlgorithm, defaultSeed } = theme;
const mapToken = defaultAlgorithm({ ...defaultSeed, ...ahaSlidesDefaultTheme.token });

// 3. Convert them to CSS Variable format
const cssVariables = [
  ...Object.entries(mapToken).filter(([key]) => !PRESET_COLOR_RE.test(key)),
  ...Object.entries(CustomColors),
]
  .map(([key, value]) => {
    const name = `--aha-${key}`;
    const unit = typeof value === 'number' && !['zIndex', 'opacity', 'weight'].some(k => key.toLowerCase().includes(k)) ? 'px' : '';
    return `  ${name}: ${value}${unit};`;
  })
  .join('\n');

const cssContent = `:root {\n${cssVariables}\n}`;

// 4. Create directory structure if it doesn't exist
const outputPath = path.resolve(__dirname, '../dist/assets/ahaslides-vars.css');
const outputDir = path.dirname(outputPath);

// Create directory recursively (won't throw error if it already exists)
fs.mkdirSync(outputDir, { recursive: true });

// 5. Save to your assets folder
fs.writeFileSync(outputPath, cssContent);
console.log('✅ AhaSlides Design tokens extracted to ahaslides-vars.css');
console.log(`📁 Output: ${outputPath}`);