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

test('collision between top-level plugin and grouped plugin throws', () => {
  const root = makeFixture({
    'ranking/frontend/package.json': '{}',
    'community/aha-plugin-group.json': '{}',
    'community/ranking/frontend/package.json': '{}',
  });
  assert.throws(
    () => listPlugins(root),
    err => {
      assert.match(err.message, /name collision/i);
      assert.match(err.message, /ranking/);
      assert.match(err.message, /community/);
      return true;
    }
  );
});

test('collision between two grouped plugins throws', () => {
  const root = makeFixture({
    'group-a/aha-plugin-group.json': '{}',
    'group-a/duplicate/frontend/package.json': '{}',
    'group-b/aha-plugin-group.json': '{}',
    'group-b/duplicate/frontend/package.json': '{}',
  });
  assert.throws(() => listPlugins(root), /name collision/i);
});

test('plugin entries include target = "ecs" by default (no group marker)', () => {
  const root = makeFixture({
    'sample-slide/frontend/package.json': '{}',
  });
  const plugins = listPlugins(root);
  assert.deepEqual(plugins.map(p => ({ name: p.name, target: p.target })), [
    { name: 'sample-slide', target: 'ecs' },
  ]);
});

test('group marker without deployment block defaults plugins to target = "ecs"', () => {
  const root = makeFixture({
    'community/aha-plugin-group.json': '{"name":"community"}',
    'community/plugin-a/frontend/package.json': '{}',
  });
  const plugins = listPlugins(root);
  assert.deepEqual(plugins.map(p => p.target), ['ecs']);
});

test('group marker with deployment.backend.target = "cloudflare-workers" tags children', () => {
  const root = makeFixture({
    'community/aha-plugin-group.json': JSON.stringify({
      name: 'community',
      deployment: { backend: { target: 'cloudflare-workers', workersSubdomain: 'my-acct' } }
    }),
    'community/plugin-a/frontend/package.json': '{}',
    'community/plugin-b/backend/package.json': '{}',
  });
  const plugins = listPlugins(root);
  assert.deepEqual(plugins.map(p => ({ name: p.name, target: p.target })).sort((a, b) => a.name.localeCompare(b.name)), [
    { name: 'plugin-a', target: 'cloudflare-workers' },
    { name: 'plugin-b', target: 'cloudflare-workers' },
  ]);
});

test('mixed groups: each group tags its own children independently', () => {
  const root = makeFixture({
    'group-a/aha-plugin-group.json': JSON.stringify({
      deployment: { backend: { target: 'cloudflare-workers', workersSubdomain: 'a' } }
    }),
    'group-a/plugin-1/frontend/package.json': '{}',
    'group-b/aha-plugin-group.json': '{}',
    'group-b/plugin-2/frontend/package.json': '{}',
    'top-level/frontend/package.json': '{}',
  });
  const plugins = listPlugins(root);
  const byName = Object.fromEntries(plugins.map(p => [p.name, p.target]));
  assert.deepEqual(byName, {
    'plugin-1': 'cloudflare-workers',
    'plugin-2': 'ecs',
    'top-level': 'ecs',
  });
});

test('target = "cloudflare-workers" without workersSubdomain throws', () => {
  const root = makeFixture({
    'community/aha-plugin-group.json': JSON.stringify({
      deployment: { backend: { target: 'cloudflare-workers' } }
    }),
    'community/plugin-a/frontend/package.json': '{}',
  });
  assert.throws(() => listPlugins(root), /workersSubdomain/i);
});

test('malformed deployment block (target is not a string) throws', () => {
  const root = makeFixture({
    'community/aha-plugin-group.json': JSON.stringify({
      deployment: { backend: { target: 42 } }
    }),
    'community/plugin-a/frontend/package.json': '{}',
  });
  assert.throws(() => listPlugins(root), /target/i);
});

test('unknown target value throws', () => {
  const root = makeFixture({
    'community/aha-plugin-group.json': JSON.stringify({
      deployment: { backend: { target: 'lambda' } }
    }),
    'community/plugin-a/frontend/package.json': '{}',
  });
  assert.throws(() => listPlugins(root), /unknown.*target.*lambda/i);
});

test('marker JSON parse error throws with file path in message', () => {
  const root = makeFixture({
    'community/aha-plugin-group.json': '{invalid json',
    'community/plugin-a/frontend/package.json': '{}',
  });
  assert.throws(() => listPlugins(root), /aha-plugin-group\.json/);
});

test('group child without frontend/ or backend/ is skipped (e.g. scripts/, docs/)', () => {
  const root = makeFixture({
    'community/aha-plugin-group.json': '{}',
    'community/scripts/some-tool.sh': '#!/bin/bash\n',
    'community/docs/README.md': '# docs\n',
    'community/plugin-a/frontend/package.json': '{}',
  });
  const plugins = listPlugins(root);
  assert.deepEqual(plugins.map(p => p.name), ['plugin-a']);
});

test('top-level folder without frontend/ or backend/ is skipped', () => {
  const root = makeFixture({
    'sample-slide/frontend/package.json': '{}',
    'docs/some-file.md': '# docs\n',
  });
  const plugins = listPlugins(root);
  assert.deepEqual(plugins.map(p => p.name), ['sample-slide']);
});

test('plugin with backend/ only (no frontend/) is recognized', () => {
  const root = makeFixture({
    'community/aha-plugin-group.json': '{}',
    'community/api-only/backend/package.json': '{}',
  });
  const plugins = listPlugins(root);
  assert.deepEqual(plugins.map(p => p.name), ['api-only']);
});
