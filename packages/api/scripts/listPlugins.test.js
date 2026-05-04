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

test('folder with aha-plugin-group.json is treated as a group; children become plugins', () => {
  const root = makeFixture({
    'sample-slide/frontend/package.json': '{}',
    'community/aha-plugin-group.json': '{"name":"community"}',
    'community/plugin-a/frontend/package.json': '{}',
    'community/plugin-b/frontend/package.json': '{}',
    'community/plugin-b/backend/package.json': '{}',
  });
  const plugins = listPlugins(root);
  assert.deepEqual(
    plugins.map(p => p.name).sort(),
    ['plugin-a', 'plugin-b', 'sample-slide']
  );
  const pluginA = plugins.find(p => p.name === 'plugin-a');
  assert.ok(
    pluginA.dir.endsWith(path.join('community', 'plugin-a')),
    'plugin-a dir is under the group folder'
  );
});

test('group folder itself is not registered as a plugin', () => {
  const root = makeFixture({
    'community/aha-plugin-group.json': '{}',
    'community/plugin-a/frontend/package.json': '{}',
  });
  const plugins = listPlugins(root);
  assert.ok(
    !plugins.some(p => p.name === 'community'),
    'group folder name does not appear as a plugin'
  );
});

test('folders starting with _ or . are skipped at top level', () => {
  const root = makeFixture({
    'sample-slide/frontend/package.json': '{}',
    '_template/frontend/package.json': '{}',
    '.cache/frontend/package.json': '{}',
  });
  const plugins = listPlugins(root);
  assert.deepEqual(plugins.map(p => p.name), ['sample-slide']);
});

test('folders starting with _ or . inside a group are skipped', () => {
  const root = makeFixture({
    'community/aha-plugin-group.json': '{}',
    'community/_template/frontend/package.json': '{}',
    'community/plugin-a/frontend/package.json': '{}',
    'community/.scratch/frontend/package.json': '{}',
  });
  const plugins = listPlugins(root);
  assert.deepEqual(plugins.map(p => p.name), ['plugin-a']);
});
