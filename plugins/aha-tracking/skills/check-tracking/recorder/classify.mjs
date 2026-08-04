// Decides whether the sweep may click an element.
//
// App-agnostic by construction: signals are ordered by reliability, and
// anything true of only one app belongs in profiles/<app>.json. Visible text
// is the LAST signal because aha-survey ships 37 locales — a Delete button
// rendered in Japanese matches no English keyword.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));

// Consequences outside the test account. Never auto-clicked without
// --allow-external.
const EXTERNAL = [
  'send', 'invite', 'pay', 'payment', 'upgrade', 'subscribe', 'checkout', 'purchase', 'billing',
  'gui', 'moi', 'thanhtoan', 'nangcap',
];

// Destroys or commits state. Auto-clicked, but queued last so it cannot
// strand the rest of the screen.
const DESTRUCTIVE = [
  'delete', 'remove', 'archive', 'reset', 'publish', 'close', 'discard', 'clear', 'revoke',
  'xoa', 'luutru', 'datlai', 'huy', 'dong',
];

export async function loadProfile(name = 'generic') {
  const text = await readFile(join(HERE, 'profiles', `${name}.json`), 'utf8');
  return JSON.parse(text);
}

// Strips diacritics and non-letters so "Xoá khảo sát" matches "xoa".
function fold(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

const hasKeyword = (text, list) => {
  const folded = fold(text);
  return folded.length > 0 && list.some((k) => folded.includes(k));
};

const matchesSelector = (el, selectors) =>
  selectors.some((s) => (s.startsWith('.') ? el.classes.includes(s.slice(1)) : false));

function isCrossOrigin(href, pageOrigin) {
  if (!href) return false;
  if (/^(mailto:|tel:)/i.test(href)) return true;
  if (!/^https?:\/\//i.test(href)) return false;
  if (!pageOrigin) return true;
  try {
    return new URL(href).origin !== pageOrigin;
  } catch {
    return false;
  }
}

export function classify(el, profile, pageOrigin = null) {
  const hit = (cls, reason) => ({ class: cls, reason });

  // 1. Not interactable at all.
  if (el.disabled) return hit('unreachable', 'disabled');
  if (el.ariaHidden) return hit('unreachable', 'aria-hidden');
  if ((el.width ?? 0) === 0 || (el.height ?? 0) === 0) return hit('unreachable', 'zero size');

  const label = el.text ?? el.ariaLabel ?? el.name;

  // 2. External consequences — checked before destructive so an "upgrade"
  //    button labelled "Delete plan" is still treated as external.
  if (matchesSelector(el, profile.external.selectors)) return hit('external', 'profile selector');
  if (el.testId && profile.external.testIds.some((t) => el.testId.includes(t))) {
    return hit('external', `profile testid ${el.testId}`);
  }
  if (el.testId && hasKeyword(el.testId, EXTERNAL)) return hit('external', `testid ${el.testId}`);
  if (hasKeyword(label, EXTERNAL)) return hit('external', `text "${label}"`);

  // 3. Destructive or committing — click, but last.
  if (matchesSelector(el, profile.destructive.selectors)) {
    return hit('last', 'profile selector (e.g. ant-btn-dangerous)');
  }
  if (el.testId && profile.destructive.testIds.some((t) => el.testId.includes(t))) {
    return hit('last', `profile testid ${el.testId}`);
  }
  if (el.testId && hasKeyword(el.testId, DESTRUCTIVE)) return hit('last', `testid ${el.testId}`);
  if (el.type === 'submit') return hit('last', 'type=submit');
  if (isCrossOrigin(el.href, pageOrigin)) return hit('last', `leaves the screen: ${el.href}`);
  if (hasKeyword(label, DESTRUCTIVE)) return hit('last', `text "${label}"`);

  // 4. Unnameable: conservative rather than optimistic. Also a real a11y defect.
  if (!label && !el.testId) {
    return hit('unreachable', 'no accessible name and no data-testid — cannot be judged safe');
  }

  return hit('safe', 'no destructive or external signal');
}
