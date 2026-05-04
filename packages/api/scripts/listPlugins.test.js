const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { listPlugins } = require('./listPlugins');

function makeFixture(layout) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'list-plugins-'));
  for (const [relPath, content] of Object.entries(layout)) {
    const full = path.join(root, relPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
  return root;
}

test('flat apps directory returns each subfolder as a plugin', () => {
  const root = makeFixture({
    'sample-slide/frontend/package.json': '{}',
    'ranking/frontend/package.json': '{}',
    'ranking/backend/package.json': '{}',
  });
  const plugins = listPlugins(root);
  assert.deepEqual(
    plugins.map(p => p.name).sort(),
    ['ranking', 'sample-slide']
  );
  for (const p of plugins) {
    assert.ok(p.dir.startsWith(root), 'dir is absolute under root');
  }
});

test('non-directory entries are ignored', () => {
  const root = makeFixture({
    'sample-slide/frontend/package.json': '{}',
    'README.md': '# hi',
  });
  const plugins = listPlugins(root);
  assert.deepEqual(plugins.map(p => p.name), ['sample-slide']);
});
