const fs = require('fs');
const path = require('path');
const Ajv = require('ajv/dist/2020');

function resolveSchemaPath() {
  // Works both pre-build (src/ → ../schema/) and post-build/published (dist/ → ./schema/).
  const candidates = [
    path.resolve(__dirname, 'schema/plugin-manifest.schema.json'),
    path.resolve(__dirname, '../schema/plugin-manifest.schema.json'),
  ];
  const found = candidates.find(fs.existsSync);
  if (!found) {
    throw new Error('plugin-manifest.schema.json not found next to generateSampleManifest');
  }
  return found;
}

const SCHEMA_URL = 'https://plugins.ahaslides.com/schema/plugin-manifest.schema.json';

function buildSampleManifest() {
  return {
    $schema: SCHEMA_URL,
    id: 'aha-survey',
    name: 'Survey',
    icon: '/icons/system-form.svg',
    baseUrl: '{{VITE_PUBLIC_BASE_URL}}',
    staticTabs: [
      { contentUrl: '/', context: 'home' },
      { contentUrl: '/', context: 'editor', name: 'Survey' },
    ],
  };
}

function validateManifest(manifest) {
  const schema = JSON.parse(fs.readFileSync(resolveSchemaPath(), 'utf8'));
  const ajv = new Ajv({ allErrors: true, strict: true });
  const validate = ajv.compile(schema);
  const ok = validate(manifest);
  return { ok, errors: validate.errors || [] };
}

function generateSampleManifest() {
  const manifest = buildSampleManifest();
  const { ok, errors } = validateManifest(manifest);
  if (!ok) {
    const detail = errors.map(e => `  ${e.instancePath || '/'} ${e.message}`).join('\n');
    throw new Error(`Sample manifest failed validation:\n${detail}`);
  }
  return manifest;
}

module.exports = {
  buildSampleManifest,
  validateManifest,
  generateSampleManifest,
};

if (require.main === module) {
  const outPath = path.resolve(__dirname, '../samples/manifest.template.json');
  try {
    const manifest = generateSampleManifest();
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2) + '\n');
    const pkgDir = path.resolve(__dirname, '..');
    console.log(`Generated ${path.relative(pkgDir, outPath)}`);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
