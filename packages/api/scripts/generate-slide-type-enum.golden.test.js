const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '../../..');
const generated = path.resolve(__dirname, '../src/slideType.ts');
const golden = path.resolve(__dirname, 'generate-slide-type-enum.golden.txt');

test('generate-slide-type-enum produces the golden snapshot for the current apps layout', () => {
  const orig = fs.readFileSync(generated, 'utf8');
  try {
    execFileSync('node', [path.resolve(__dirname, 'generate-slide-type-enum.js')], {
      cwd: repoRoot,
      stdio: 'pipe',
    });
    const produced = fs.readFileSync(generated, 'utf8');
    const expected = fs.readFileSync(golden, 'utf8');
    assert.strictEqual(produced, expected);
  } finally {
    fs.writeFileSync(generated, orig);
  }
});
