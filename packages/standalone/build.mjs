// Builds the single-file browser global for @aha/standalone.
//
//   dist/aha-slide-plugin.global.js      IIFE, minified, exposes window.AhaSlidePlugin
//   dist/aha-slide-plugin.global.js.map  source map
//
// The ESM entry (dist/index.js) and the type declarations (dist/index.d.ts) are
// produced by `tsc` (see the package "build" script); this step only produces
// the bundled, script-tag-loadable global. Run via `npm run build`.

import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
);

// NOTE: keep the banner deterministic — no timestamps or other per-build values,
// so the same commit produces byte-identical output (reproducible build; Turbo's
// dist/** cache stays valid). The version is recorded in dist/VERSION too.
const banner = [
  `/*! AhaSlides Slide Plugin SDK — standalone global build v${pkg.version}`,
  ` *  bundles @aha/ui-vanilla + @aha/api + @aha/common`,
  ` *  global: window.AhaSlidePlugin`,
  ` */`,
].join('\n');

const result = await build({
  entryPoints: [fileURLToPath(new URL('./src/index.ts', import.meta.url))],
  bundle: true,
  format: 'iife',
  globalName: 'AhaSlidePlugin',
  platform: 'browser',
  target: ['es2019'],
  minify: true,
  sourcemap: true,
  banner: { js: banner },
  // zoid and some deps branch on process.env.NODE_ENV; pin it for the browser.
  define: { 'process.env.NODE_ENV': '"production"' },
  outfile: fileURLToPath(
    new URL('./dist/aha-slide-plugin.global.js', import.meta.url),
  ),
  metafile: true,
  logLevel: 'info',
});

// Stamp the resolved version next to the artifact so CI / consumers can read it
// without parsing the bundle.
writeFileSync(
  fileURLToPath(new URL('./dist/VERSION', import.meta.url)),
  `${pkg.version}\n`,
);

const outSize = Object.entries(result.metafile.outputs)
  .filter(([file]) => !file.endsWith('.map'))
  .reduce((n, [, o]) => n + o.bytes, 0);
console.log(
  `@aha/standalone: built dist/aha-slide-plugin.global.js v${pkg.version} (~${Math.round(
    outSize / 1024,
  )} KB minified)`,
);
