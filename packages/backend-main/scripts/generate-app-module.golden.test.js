const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '../../..');
const generated = path.resolve(__dirname, '../src/app.module.ts');
const pkgFile = path.resolve(__dirname, '../package.json');
const golden = path.resolve(__dirname, 'generate-app-module.golden.txt');

test('generate-app-module produces the golden snapshot for the current apps layout', () => {
  // Save originals so the test never leaves dirty state.
  const origModule = fs.readFileSync(generated, 'utf8');
  const origPkg = fs.readFileSync(pkgFile, 'utf8');
  try {
    execFileSync('node', [path.resolve(__dirname, 'generate-app-module.js')], {
      cwd: repoRoot,
      stdio: 'pipe',
    });
    const produced = fs.readFileSync(generated, 'utf8');
    const expected = fs.readFileSync(golden, 'utf8');
    assert.strictEqual(produced, expected,
      'generator output diverged from golden snapshot — if intentional, regenerate the snapshot');
  } finally {
    fs.writeFileSync(generated, origModule);
    fs.writeFileSync(pkgFile, origPkg);
  }
});
