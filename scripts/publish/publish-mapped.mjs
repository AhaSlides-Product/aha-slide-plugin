// Publishes each mapped package to the registry configured by the workflow's
// setup-node step. Shared by both publish workflows.
//
// Env:
//   NODE_AUTH_TOKEN  the registry auth token (required).
//   PUBLISH_ACCESS   when 'public', pass `--access public` (public npm needs it;
//                    the GitHub-Packages workflow leaves it unset).
//
// A 409 (version already published) is treated as skip, not failure.
import { spawnSync } from 'node:child_process';
import { NAME_MAP } from './name-map.mjs';

if (!process.env.NODE_AUTH_TOKEN) {
  console.error('::error::npm auth token (NODE_AUTH_TOKEN) is empty');
  process.exit(1);
}

const accessPublic = process.env.PUBLISH_ACCESS === 'public';
const skipped = [];
const failed = [];

for (const published of Object.values(NAME_MAP)) {
  console.log('::group::Publishing ' + published);
  const args = ['publish', '-w', published];
  if (accessPublic) args.push('--access', 'public');
  const result = spawnSync('npm', args, {
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'pipe'],
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  console.log('::endgroup::');

  if (result.status === 0) continue;

  const combined = (result.stdout || '') + (result.stderr || '');
  const isConflict = /\b409\b/.test(combined)
    || /EPUBLISHCONFLICT/i.test(combined)
    || /cannot publish over the previously published versions/i.test(combined)
    || /You cannot publish over the previously published version/i.test(combined);

  if (isConflict) {
    console.log('::warning::' + published + ' already published at this version (409). Skipping.');
    skipped.push(published);
  } else {
    console.log('::error::' + published + ' failed to publish (exit ' + result.status + ')');
    failed.push(published);
  }
}

if (skipped.length) console.log('Skipped (already published): ' + skipped.join(', '));
if (failed.length) {
  console.error('Failed to publish: ' + failed.join(', '));
  process.exit(1);
}
