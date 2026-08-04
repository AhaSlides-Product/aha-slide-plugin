import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classify, loadProfile } from '../classify.mjs';

const generic = await loadProfile('generic');
const el = (over = {}) => ({
  tag: 'button', text: 'Preview', testId: null, ariaLabel: null, name: null,
  role: null, type: null, href: null, classes: [], disabled: false,
  ariaHidden: false, width: 80, height: 32, section: null, path: 'button',
  ...over,
});

test('an ordinary button is safe', () => {
  assert.equal(classify(el(), generic).class, 'safe');
});

test('a disabled element is unreachable', () => {
  assert.equal(classify(el({ disabled: true }), generic).class, 'unreachable');
});

test('a zero-size element is unreachable', () => {
  assert.equal(classify(el({ width: 0, height: 0 }), generic).class, 'unreachable');
});

test('aria-hidden is unreachable', () => {
  assert.equal(classify(el({ ariaHidden: true }), generic).class, 'unreachable');
});

test('an icon-only button with no name and no testid is unreachable', () => {
  const r = classify(el({ text: null, ariaLabel: null, testId: null }), generic);
  assert.equal(r.class, 'unreachable');
  assert.match(r.reason, /no accessible name/);
});

test('ant-btn-dangerous is destructive regardless of language', () => {
  const r = classify(el({ text: '削除', classes: ['ant-btn', 'ant-btn-dangerous'] }), generic);
  assert.equal(r.class, 'last');
  assert.match(r.reason, /ant-btn-dangerous/);
});

test('a destructive testid outranks harmless visible text', () => {
  const r = classify(el({ text: 'OK', testId: 'canvas-image-delete-btn' }), generic);
  assert.equal(r.class, 'last');
  assert.match(r.reason, /testid/);
});

test('an external testid classifies as external, not merely destructive', () => {
  assert.equal(classify(el({ text: 'OK', testId: 'csat-send-btn' }), generic).class, 'external');
});

test('external outranks destructive when both match', () => {
  const r = classify(el({ text: 'Delete', testId: 'billing-upgrade-cta' }), generic);
  assert.equal(r.class, 'external');
});

test('English destructive text is the last-resort signal', () => {
  assert.equal(classify(el({ text: 'Delete survey' }), generic).class, 'last');
});

test('Vietnamese destructive text is recognised', () => {
  assert.equal(classify(el({ text: 'Xoá khảo sát' }), generic).class, 'last');
});

test('type=submit is queued last', () => {
  assert.equal(classify(el({ tag: 'input', type: 'submit', text: null, testId: 'x' }), generic).class, 'last');
});

test('a cross-origin link is queued last', () => {
  const r = classify(el({ tag: 'a', text: 'Docs', href: 'https://other.example/docs' }), generic, 'https://app.example');
  assert.equal(r.class, 'last');
});

test('a same-origin relative link stays safe', () => {
  assert.equal(classify(el({ tag: 'a', text: 'Settings', href: '/settings' }), generic).class, 'safe');
});

test('a profile selector adds an app-specific destructive rule', () => {
  const profile = {
    external: { testIds: [], selectors: [] },
    destructive: { testIds: [], selectors: ['.danger-zone-btn'] },
  };
  const r = classify(el({ classes: ['danger-zone-btn'] }), profile);
  assert.equal(r.class, 'last');
});

test('an aria-label alone is enough to be judged', () => {
  const r = classify(el({ text: null, ariaLabel: 'Delete block' }), generic);
  assert.equal(r.class, 'last');
});

test('a mailto link is treated as leaving the app', () => {
  const r = classify(el({ tag: 'a', text: 'Contact', href: 'mailto:qa@example.com' }), generic);
  assert.equal(r.class, 'last');
});
