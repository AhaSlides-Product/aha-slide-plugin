import test from 'node:test';
import assert from 'node:assert/strict';
import { getPluginBackendUrl } from './pluginBackendUrl.ts';

test('getPluginBackendUrl composes the workers.dev URL', () => {
  assert.strictEqual(
    getPluginBackendUrl('my-plugin', 'ahaslide-plugins'),
    'https://my-plugin.ahaslide-plugins.workers.dev'
  );
});

test('getPluginBackendUrl handles plugin names with hyphens', () => {
  assert.strictEqual(
    getPluginBackendUrl('quiz-leaderboard', 'aha'),
    'https://quiz-leaderboard.aha.workers.dev'
  );
});
