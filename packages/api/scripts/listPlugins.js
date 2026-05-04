const fs = require('fs');
const path = require('path');

function listPlugins(appsDir) {
  const result = [];
  for (const entry of fs.readdirSync(appsDir)) {
    const full = path.join(appsDir, entry);
    if (!fs.statSync(full).isDirectory()) continue;
    result.push({ name: entry, dir: full });
  }
  return result;
}

module.exports = { listPlugins };
