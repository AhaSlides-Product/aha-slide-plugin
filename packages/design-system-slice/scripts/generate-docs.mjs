import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import antDesignTokens from '@aha/design';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const contractPath = join(root, 'contract', 'button.contract.json');
const outDir = join(root, 'generated');

const contract = JSON.parse(readFileSync(contractPath, 'utf8'));

/** Resolve a token name to its live value from @aha/design (single source of truth). */
function tokenValue(name) {
  return Object.prototype.hasOwnProperty.call(antDesignTokens, name)
    ? antDesignTokens[name]
    : '(not defined in @aha/design)';
}

const resolvedTokens = Object.fromEntries(
  contract.tokenBindings.consumes.map((name) => [name, tokenValue(name)]),
);

const propRows = Object.entries(contract.props);

function propValues(def) {
  if (def.type === 'enum') return def.values.join(' \\| ');
  if (def.type === 'boolean') return 'true \\| false';
  return 'ReactNode (React) / slot (Vue)';
}

function generateMarkdown() {
  const lines = [];
  lines.push(`# ${contract.component}`, '');
  lines.push('> Generated from `button.contract.json` — do not edit by hand. Run `npm run generate` to refresh.', '');
  lines.push(contract.summary, '');
  if (contract.webComponent) {
    lines.push(`Primitive: \`<${contract.webComponent.tag}>\` (\`${contract.webComponent.package}\`) — one framework-agnostic element imported unchanged by React and Vue.`, '');
  }
  lines.push(`Composite/legacy wrappers: React \`${contract.wraps.react.package}@${contract.wraps.react.major}\` · Vue \`${contract.wraps.vue.package}@${contract.wraps.vue.major}\`.`, '');
  lines.push('## Props', '');
  lines.push('| Prop | Type | Values | Default | Description |');
  lines.push('| --- | --- | --- | --- | --- |');
  for (const [name, def] of propRows) {
    lines.push(`| \`${name}\` | ${def.type} | ${propValues(def)} | \`${JSON.stringify(def.default)}\` | ${def.description} |`);
  }
  lines.push('');
  lines.push('## Design tokens', '');
  lines.push(`Consumed live from \`${contract.tokenBindings.source}\`:`, '');
  lines.push('| Token | Value |');
  lines.push('| --- | --- |');
  for (const [name, value] of Object.entries(resolvedTokens)) {
    lines.push(`| \`${name}\` | \`${value}\` |`);
  }
  lines.push('');
  return lines.join('\n');
}

function generateLlmsFragment() {
  const lines = [];
  lines.push(`## ${contract.component}`);
  lines.push(contract.summary);
  if (contract.webComponent) {
    lines.push(`Primitive element: <${contract.webComponent.tag}> (${contract.webComponent.package}) — framework-agnostic, imported unchanged by React and Vue.`);
  }
  lines.push(`Composite/legacy wrappers: React (${contract.wraps.react.package}@${contract.wraps.react.major}), Vue (${contract.wraps.vue.package}@${contract.wraps.vue.major}).`);
  lines.push('Props:');
  for (const [name, def] of propRows) {
    const vals = def.type === 'enum' ? ` one of [${def.values.join(', ')}]` : def.type === 'boolean' ? ' boolean' : ' node/slot';
    lines.push(`- ${name}:${vals}, default ${JSON.stringify(def.default)}. ${def.description}`);
  }
  lines.push(`Tokens (from ${contract.tokenBindings.source}): ${Object.entries(resolvedTokens).map(([k, v]) => `${k}=${v}`).join(', ')}.`);
  return lines.join('\n') + '\n';
}

function generateAgentJson() {
  return JSON.stringify(
    {
      generatedFrom: 'button.contract.json',
      generatedAt: null,
      component: contract.component,
      summary: contract.summary,
      primitive: contract.webComponent ?? null,
      frameworks: contract.wraps,
      props: contract.props,
      resolvedTokens,
    },
    null,
    2,
  ) + '\n';
}

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'Button.md'), generateMarkdown());
writeFileSync(join(outDir, 'button.llms.txt'), generateLlmsFragment());
writeFileSync(join(outDir, 'button.agent.json'), generateAgentJson());

console.log('Generated docs from button.contract.json:');
console.log('  generated/Button.md');
console.log('  generated/button.llms.txt');
console.log('  generated/button.agent.json');
