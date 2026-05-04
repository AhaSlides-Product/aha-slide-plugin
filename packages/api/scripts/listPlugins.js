const fs = require('fs');
const path = require('path');

const GROUP_MARKER = 'aha-plugin-group.json';

function isSkipped(name) {
  return name.startsWith('_') || name.startsWith('.');
}

function listPlugins(appsDir) {
  const result = [];
  const byName = new Map();

  function add(name, dir) {
    if (byName.has(name)) {
      throw new Error(
        `Slide-type name collision: "${name}" exists in both\n  ${byName.get(name)}\n  ${dir}`
      );
    }
    byName.set(name, dir);
    result.push({ name, dir });
  }

  for (const entry of fs.readdirSync(appsDir)) {
    if (isSkipped(entry)) continue;
    const full = path.join(appsDir, entry);
    if (!fs.statSync(full).isDirectory()) continue;
    if (fs.existsSync(path.join(full, GROUP_MARKER))) {
      for (const child of fs.readdirSync(full)) {
        if (isSkipped(child)) continue;
        const childFull = path.join(full, child);
        if (!fs.statSync(childFull).isDirectory()) continue;
        add(child, childFull);
      }
    } else {
      add(entry, full);
    }
  }
  return result;
}

module.exports = { listPlugins, GROUP_MARKER };
