import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pairSession } from '../pair.mjs';

const build = (timeline) => ({ meta: { signalDetected: true }, screens: [], timeline });
const click = (seq, t, text) => ({ seq, t, kind: 'action', type: 'click', el: { text }, origin: 'auto' });
const ev = (seq, t, name, props = {}) => ({ seq, t, kind: 'event', name, props });

test('an event inside the window attaches to the preceding action', () => {
  const { pairs } = pairSession(build([click(1, 0, 'Publish'), ev(2, 200, 'survey.publish')]));
  assert.equal(pairs.length, 1);
  assert.equal(pairs[0].events[0].name, 'survey.publish');
  assert.deepEqual(pairs[0].flags, []);
});

test('an event beyond the window becomes an orphan', () => {
  const { pairs, orphans } = pairSession(build([click(1, 0, 'Publish'), ev(2, 5000, 'timer')]));
  assert.deepEqual(pairs[0].flags, ['no-event']);
  assert.equal(orphans.length, 1);
  assert.equal(orphans[0].name, 'timer');
});

test('an event with no preceding action is an orphan', () => {
  const { orphans } = pairSession(build([ev(1, 10, 'page.view')]));
  assert.equal(orphans.length, 1);
});

test('an action with no event is flagged no-event', () => {
  const { pairs } = pairSession(build([click(1, 0, 'Duplicate')]));
  assert.deepEqual(pairs[0].flags, ['no-event']);
});

test('the same event twice in one window is flagged duplicate', () => {
  const { pairs } = pairSession(
    build([click(1, 0, 'Save'), ev(2, 100, 'survey.save'), ev(3, 200, 'survey.save')]),
  );
  assert.ok(pairs[0].flags.includes('duplicate'));
});

test('an _anonymous name is flagged', () => {
  const { pairs } = pairSession(build([click(1, 0, 'x'), ev(2, 50, 'click_anonymous')]));
  assert.ok(pairs[0].flags.includes('anonymous-name'));
});

test('an undefined_action name is flagged', () => {
  const { pairs } = pairSession(build([click(1, 0, 'x'), ev(2, 50, 'undefined_action_thing')]));
  assert.ok(pairs[0].flags.includes('undefined-action'));
});

test('null, undefined and empty-string props are flagged', () => {
  const { pairs } = pairSession(
    build([click(1, 0, 'x'), ev(2, 50, 'survey.x', { survey_id: null, name: '' })]),
  );
  assert.ok(pairs[0].flags.includes('empty-props'));
});

test('a healthy prop set is not flagged', () => {
  const { pairs } = pairSession(
    build([click(1, 0, 'x'), ev(2, 50, 'survey.x', { survey_id: 42, variant: 'classic' })]),
  );
  assert.deepEqual(pairs[0].flags, []);
});

test('a navigation attributes its follow-on event and lands in transitions', () => {
  const timeline = [
    { seq: 1, t: 0, kind: 'action', type: 'navigate', from: 'a', to: 'b' },
    ev(2, 300, 'survey.editor_opened'),
  ];
  const { transitions } = pairSession(build(timeline));
  assert.equal(transitions.length, 1);
  assert.equal(transitions[0].events[0].name, 'survey.editor_opened');
  assert.deepEqual(transitions[0].flags, []);
});

test('a navigation with no event is flagged, exposing a funnel gap', () => {
  const timeline = [{ seq: 1, t: 0, kind: 'action', type: 'navigate', from: 'a', to: 'b' }];
  const { transitions } = pairSession(build(timeline));
  assert.deepEqual(transitions[0].flags, ['no-event']);
});

test('a later action takes ownership of subsequent events', () => {
  const timeline = [click(1, 0, 'A'), click(2, 100, 'B'), ev(3, 150, 'survey.b')];
  const { pairs } = pairSession(build(timeline));
  assert.deepEqual(pairs[0].flags, ['no-event']);
  assert.equal(pairs[1].events[0].name, 'survey.b');
});

test('an empty timeline yields empty results', () => {
  const r = pairSession(build([]));
  assert.deepEqual(r.pairs, []);
  assert.equal(r.checks.totalActions, 0);
});

test('checks report the totals', () => {
  const r = pairSession(build([click(1, 0, 'A'), ev(2, 50, 'x'), ev(3, 9000, 'orphan')]));
  assert.deepEqual(r.checks, {
    signalDetected: true, totalActions: 1, totalEvents: 2, totalOrphans: 1,
  });
});

test('the window boundary is inclusive at exactly 1500ms', () => {
  const inside = pairSession(build([click(1, 0, 'A'), ev(2, 1500, 'x')]));
  assert.equal(inside.pairs[0].events.length, 1);
  const outside = pairSession(build([click(1, 0, 'A'), ev(2, 1501, 'x')]));
  assert.equal(outside.pairs[0].events.length, 0);
  assert.equal(outside.orphans.length, 1);
});

test('the window is configurable', () => {
  const r = pairSession(build([click(1, 0, 'A'), ev(2, 3000, 'x')]), { windowMs: 5000 });
  assert.equal(r.pairs[0].events.length, 1);
});

test('signalDetected false is carried into checks', () => {
  const s = { meta: { signalDetected: false }, screens: [], timeline: [] };
  assert.equal(pairSession(s).checks.signalDetected, false);
});

test('entries are paired in seq order even if the timeline arrives shuffled', () => {
  const shuffled = [ev(2, 200, 'survey.publish'), click(1, 0, 'Publish')];
  const { pairs } = pairSession(build(shuffled));
  assert.equal(pairs[0].events[0].name, 'survey.publish');
});
