const fs = require('fs');
const path = require('path');

const GROUP_MARKER = 'aha-plugin-group.json';
const VALID_TARGETS = new Set(['ecs', 'cloudflare-workers']);

function isSkipped(name) {
  return name.startsWith('_') || name.startsWith('.');
}

function readGroupTarget(markerPath) {
  let raw;
  try {
    raw = fs.readFileSync(markerPath, 'utf8');
  } catch (e) {
    throw new Error(`Failed to read ${markerPath}: ${e.message}`);
  }
  let marker;
  try {
    marker = JSON.parse(raw);
  } catch (e) {
    throw new Error(`Failed to parse ${markerPath}: ${e.message}`);
  }
  const deployment = marker.deployment;
  if (!deployment || !deployment.backend) {
    return { target: 'ecs' };
  }
  const target = deployment.backend.target;
  if (target === undefined) {
    return { target: 'ecs' };
  }
  if (typeof target !== 'string') {
    throw new Error(`${markerPath}: deployment.backend.target must be a string`);
  }
  if (!VALID_TARGETS.has(target)) {
    throw new Error(`${markerPath}: unknown deployment.backend.target "${target}". Valid: ${[...VALID_TARGETS].join(', ')}`);
  }
  if (target === 'cloudflare-workers') {
    const sub = deployment.backend.workersSubdomain;
    if (typeof sub !== 'string' || sub.length === 0) {
      throw new Error(`${markerPath}: deployment.backend.workersSubdomain is required when target = "cloudflare-workers"`);
    }
  }
  return { target };
}

function listPlugins(appsDir) {
  const result = [];
  const byName = new Map();

  function add(name, dir, target) {
    if (byName.has(name)) {
      throw new Error(
        `Slide-type name collision: "${name}" exists in both\n  ${byName.get(name)}\n  ${dir}`
      );
    }
    byName.set(name, dir);
    result.push({ name, dir, target });
  }

  for (const entry of fs.readdirSync(appsDir)) {
    if (isSkipped(entry)) continue;
    const full = path.join(appsDir, entry);
    if (!fs.statSync(full).isDirectory()) continue;
    const markerPath = path.join(full, GROUP_MARKER);
    if (fs.existsSync(markerPath)) {
      const { target } = readGroupTarget(markerPath);
      for (const child of fs.readdirSync(full)) {
        if (isSkipped(child)) continue;
        const childFull = path.join(full, child);
        if (!fs.statSync(childFull).isDirectory()) continue;
        add(child, childFull, target);
      }
    } else {
      add(entry, full, 'ecs');
    }
  }
  return result;
}

module.exports = { listPlugins, GROUP_MARKER };
