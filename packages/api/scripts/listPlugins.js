const fs = require('fs');
const path = require('path');

const GROUP_MARKER = 'aha-plugin-group.json';

function isSkipped(name) {
  return name.startsWith('_') || name.startsWith('.');
}

function listPlugins(appsDir) {
  const result = [];
  for (const entry of fs.readdirSync(appsDir)) {
    if (isSkipped(entry)) continue;
    const full = path.join(appsDir, entry);
    if (!fs.statSync(full).isDirectory()) continue;
    if (fs.existsSync(path.join(full, GROUP_MARKER))) {
      for (const child of fs.readdirSync(full)) {
        if (isSkipped(child)) continue;
        const childFull = path.join(full, child);
        if (!fs.statSync(childFull).isDirectory()) continue;
        result.push({ name: child, dir: childFull });
      }
    } else {
      result.push({ name: entry, dir: full });
    }
  }
  return result;
}

module.exports = { listPlugins, GROUP_MARKER };
