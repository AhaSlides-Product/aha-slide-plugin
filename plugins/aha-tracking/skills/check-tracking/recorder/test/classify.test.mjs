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


// --- PR #125 review findings ------------------------------------------------

test('common English labels are not swallowed by short foreign keywords', () => {
  // "gui" (Vietnamese "gửi") and "pay" are substrings of ordinary words. A
  // false `external` hit means the element is skipped and reported unchecked.
  for (const text of ['Guide', 'Guidelines', 'Guided tour', 'Repay later', 'Company']) {
    assert.equal(classify(el({ text }), generic).class, 'safe', `"${text}" must stay safe`);
  }
});

test('whole-word keywords still match what they should', () => {
  assert.equal(classify(el({ text: 'Send' }), generic).class, 'external');
  assert.equal(classify(el({ text: 'Upgrade plan' }), generic).class, 'external');
  assert.equal(classify(el({ text: 'Gửi lời mời' }), generic).class, 'external');
});

test('folded Vietnamese phrases survive word splitting', () => {
  // "Thanh toán" folds to `thanhtoan`, which is not a word in the split label.
  assert.equal(classify(el({ text: 'Thanh toán' }), generic).class, 'external');
  assert.equal(classify(el({ text: 'Lưu trữ' }), generic).class, 'last');
  assert.equal(classify(el({ text: 'Đặt lại' }), generic).class, 'last');
});

test('kebab-case testids still match, and guide-btn does not', () => {
  assert.equal(classify(el({ text: 'OK', testId: 'csat-send-btn' }), generic).class, 'external');
  assert.equal(classify(el({ text: 'OK', testId: 'creation-upgrade-cta' }), generic).class, 'external');
  assert.equal(classify(el({ text: 'OK', testId: 'canvas-image-delete-btn' }), generic).class, 'last');
  assert.equal(classify(el({ text: 'OK', testId: 'guide-btn' }), generic).class, 'safe');
});

test('mailto and tel are external, not last', () => {
  // `last` is clicked unconditionally; these hand off to an OS app, so they
  // belong behind --allow-external.
  for (const href of ['mailto:qa@example.com', 'tel:+84123', 'sms:+84123']) {
    const r = classify(el({ tag: 'a', text: 'Contact', href }), generic, 'https://app.example');
    assert.equal(r.class, 'external', `${href} must be gated`);
  }
});

test('an off-site http link stays in last — navigation is recoverable', () => {
  const r = classify(el({ tag: 'a', text: 'Docs', href: 'https://other.example/d' }), generic, 'https://app.example');
  assert.equal(r.class, 'last');
});
