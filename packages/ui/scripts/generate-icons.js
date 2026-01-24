import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconsDir = path.resolve(__dirname, '../src/icons');
const outputDir = path.resolve(__dirname, '../dist/icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('🎨 Generating Vue icon components...\n');

// Read all SVG files
const svgFiles = fs.readdirSync(iconsDir).filter(f => f.endsWith('.svg'));
let generatedCount = 0;

svgFiles.forEach(file => {
  const iconName = path.basename(file, '.svg');

  // Convert aha-align-center to AhaAlignCenter
  const componentName = iconName
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  // Read SVG content
  const svgPath = path.join(iconsDir, file);
  let svgContent = fs.readFileSync(svgPath, 'utf-8').trim();

  // Extract viewBox from original SVG if it exists
  const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 16 16';

  // Extract inner content of SVG (everything between <svg> and </svg>)
  const innerContentMatch = svgContent.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
  const innerContent = innerContentMatch ? innerContentMatch[1].trim() : svgContent;

  // Escape backticks and ${} in SVG content for template literal
  const escapedContent = innerContent.replace(/`/g, '\\`').replace(/\$/g, '\\$');

  // Generate functional component using Ant Design's Icon wrapper
  const jsComponent = `import { defineComponent, h } from 'vue';
import Icon from '@ant-design/icons-vue';

const ${componentName}Svg = () => h('svg', {
  width: '1em',
  height: '1em',
  fill: 'currentColor',
  viewBox: '${viewBox}',
  innerHTML: \`${escapedContent}\`
});

const ${componentName} = defineComponent({
  name: '${componentName}',
  displayName: '${componentName}',
  setup() {
    return () => h(Icon, null, {
      component: ${componentName}Svg
    });
  }
});

export default ${componentName};
`;

  // Write JS component (not .vue file, but .ts file for functional component)
  const outputPath = path.join(outputDir, `${componentName}.ts`);
  fs.writeFileSync(outputPath, jsComponent, 'utf-8');
  generatedCount++;

  if (generatedCount % 30 === 0) {
    console.log(`  ✓ Generated ${generatedCount} components...`);
  }
});

console.log(`\n✅ Generated ${generatedCount} Vue components\n`);

// Generate index.ts file for exports
console.log('📦 Generating index.ts...');
const exports = svgFiles.map(file => {
  const iconName = path.basename(file, '.svg');
  const componentName = iconName
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  return `export { default as ${componentName} } from './${componentName}';`;
}).join('\n');

const indexContent = `// Auto-generated icon exports
// To regenerate, run: npm run generate:icons

${exports}
`;

fs.writeFileSync(path.join(outputDir, 'index.ts'), indexContent, 'utf-8');
console.log('  ✅ Generated index.ts\n');

console.log('✨ Icon generation complete!');
console.log(`   📁 Output: ${outputDir}`);
console.log(`   🎯 Generated ${generatedCount} components`);
console.log(`\n   Usage example:`);
console.log(`   import { AhaStar, AhaHeart } from '@aha/ui/icons';`);

