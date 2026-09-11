// Builds exactly the mapped (to-be-published) packages via turbo, using the
// shared name map. Run after apply-name-map.mjs + npm install.
import { execSync } from 'node:child_process';
import { NAME_MAP } from './name-map.mjs';

const filters = Object.values(NAME_MAP).map((n) => '--filter=' + n).join(' ');
execSync('npx turbo run build ' + filters, { stdio: 'inherit' });
