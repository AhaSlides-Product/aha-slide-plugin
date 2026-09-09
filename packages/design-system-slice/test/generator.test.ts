import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { SeedTokens } from '@aha/design';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const gen = join(root, 'scripts', 'generate-docs.mjs');
const outDir = join(root, 'generated');

describe('generator emits docs from the contract with live @aha/design tokens', () => {
  it('runs and produces all three artefacts, carrying the live colorPrimary token', () => {
    execFileSync('node', [gen], { cwd: root });

    const md = readFileSync(join(outDir, 'Button.md'), 'utf8');
    const llms = readFileSync(join(outDir, 'button.llms.txt'), 'utf8');
    const agent = JSON.parse(readFileSync(join(outDir, 'button.agent.json'), 'utf8'));

    expect(md).toContain('# Button');
    expect(md).toContain(SeedTokens.colorPrimary);
    expect(llms).toContain('## Button');
    expect(agent.resolvedTokens.colorPrimary).toBe(SeedTokens.colorPrimary);
    expect(agent.generatedFrom).toBe('button.contract.json');
  });
});
