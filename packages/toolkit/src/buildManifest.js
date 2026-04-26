#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { validateManifest } = require('./generateSampleManifest');

const PLACEHOLDER_RE = /\{\{\s*([A-Z0-9_]+)\s*\}\}/g;

function substituteEnv(source, env) {
  const resolvedEnv = env || process.env;
  const missing = new Set();
  const out = source.replace(PLACEHOLDER_RE, (_, name) => {
    const value = resolvedEnv[name];
    if (value === undefined || value === '') {
      missing.add(name);
      return '';
    }
    return value;
  });
  if (missing.size > 0) {
    throw new Error(
      `Missing env values for placeholders: ${[...missing].join(', ')}`
    );
  }
  return out;
}

function buildManifest(options) {
  const { templatePath, env } = options || {};
  if (!templatePath) {
    throw new Error('buildManifest: templatePath is required');
  }
  const raw = fs.readFileSync(templatePath, 'utf8');
  const substituted = substituteEnv(raw, env);
  const manifest = JSON.parse(substituted);
  const { ok, errors } = validateManifest(manifest);
  if (!ok) {
    const detail = errors
      .map(e => `  ${e.instancePath || '/'} ${e.message}`)
      .join('\n');
    throw new Error(`Built manifest failed validation:\n${detail}`);
  }
  return manifest;
}

module.exports = { substituteEnv, buildManifest };

if (require.main === module) {
  const pkgDir = path.resolve(__dirname, '..');
  const templatePath = path.resolve(pkgDir, 'samples/manifest.template.json');
  const outPath = path.resolve(pkgDir, 'samples/manifest.json');
  try {
    const manifest = buildManifest({ templatePath });
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2) + '\n');
    console.log(`Built ${path.relative(pkgDir, outPath)}`);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
