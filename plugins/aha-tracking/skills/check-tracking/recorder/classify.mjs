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

// Keywords match WHOLE WORDS, never substrings. Substring matching on a folded
// label is unusable here: short tokens like `gui` (Vietnamese "gửi") and `pay`
// swallow ordinary English labels — "Guide", "Guidelines" and "Repay" each
// contain one. A false `external` hit means the element is silently skipped and
// reported as unchecked, so a false coverage gap on a label as common as
// "Guide" is far worse than missing an exotic one.
//
// `phrases` exist because folding removes separators: Vietnamese "Thanh toán"
// folds to `thanhtoan`, which is not a word in the split label. Phrases match
// against the whole folded string and are long enough that a false positive is
// implausible.

// Consequences outside the test account. Never auto-clicked without
// --allow-external.
const EXTERNAL = {
  words: [
    'send', 'invite', 'pay', 'payment', 'upgrade', 'subscribe', 'checkout',
    'purchase', 'billing', 'gui', 'moi',
  ],
  phrases: ['thanhtoan', 'nangcap'],
};

// Destroys or commits state. Auto-clicked, but queued last so it cannot
// strand the rest of the screen.
const DESTRUCTIVE = {
  words: [
    'delete', 'remove', 'archive', 'reset', 'publish', 'close', 'discard',
    'clear', 'revoke', 'xoa', 'huy', 'dong',
  ],
  phrases: ['luutru', 'datlai'],
};

export async function loadProfile(name = 'generic') {
  const text = await readFile(join(HERE, 'profiles', `${name}.json`), 'utf8');
  return JSON.parse(text);
}

// Strips diacritics so "Xoá" becomes "xoa". Separators survive here so the
// caller can split into words; `fold` collapses them out.
function normalise(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase();
}

const foldWords = (text) => normalise(text).split(/[^a-z0-9]+/).filter(Boolean);
const fold = (text) => normalise(text).replace(/[^a-z0-9]/g, '');

const hasKeyword = (text, { words, phrases }) => {
  const parts = foldWords(text);
  if (parts.length === 0) return false;
  if (parts.some((w) => words.includes(w))) return true;
  const joined = fold(text);
  return phrases.some((p) => joined.includes(p));
};

const matchesSelector = (el, selectors) =>
  selectors.some((s) => (s.startsWith('.') ? el.classes.includes(s.slice(1)) : false));

// mailto: / tel: / sms: hand off to an OS application. That is a consequence
// outside the browser, so it belongs behind the --allow-external gate rather
// than in the `last` bucket, which the sweep clicks unconditionally.
const isAppLaunch = (href) => Boolean(href) && /^(mailto:|tel:|sms:)/i.test(href);

// An off-site http(s) link merely navigates away, and recover() returns to the
// screen — safe to click, just disruptive enough to leave until last.
function isOffSite(href, pageOrigin) {
  if (!href) return false;
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
  if (isAppLaunch(el.href)) return hit('external', `hands off to an OS app: ${el.href}`);
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
  if (isOffSite(el.href, pageOrigin)) return hit('last', `leaves the screen: ${el.href}`);
  if (hasKeyword(label, DESTRUCTIVE)) return hit('last', `text "${label}"`);

  // 4. Unnameable: conservative rather than optimistic. Also a real a11y defect.
  if (!label && !el.testId) {
    return hit('unreachable', 'no accessible name and no data-testid — cannot be judged safe');
  }

  return hit('safe', 'no destructive or external signal');
}
