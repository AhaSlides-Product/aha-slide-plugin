import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSession } from '../session.mjs';

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64');
const trackBody = (name) => 'data=' + b64({ event: name, properties: { a: 1 } });

test('starts with signalDetected false and an empty timeline', () => {
  const s = createSession({ allowExternal: false, recorderVersion: '1.0.0' });
  const json = s.toJSON();
  assert.equal(json.meta.signalDetected, false);
  assert.equal(json.timeline.length, 0);
  assert.equal(json.meta.allowExternal, false);
});

test('an action record becomes an action timeline entry', () => {
  const s = createSession({});
  s.addRaw({ kind: 'action', type: 'click', el: { tag: 'button', text: 'Publish' } }, 'top');
  const [entry] = s.toJSON().timeline;
  assert.equal(entry.kind, 'action');
  assert.equal(entry.type, 'click');
  assert.equal(entry.el.text, 'Publish');
  assert.equal(entry.seq, 1);
});

test('a tracking payload becomes an event entry and flips signalDetected', () => {
  const s = createSession({});
  s.addRaw({ kind: 'raw', via: 'sendBeacon', url: 'https://x/track/', body: trackBody('survey.x') }, 'top');
  const json = s.toJSON();
  assert.equal(json.meta.signalDetected, true);
  assert.equal(json.timeline[0].kind, 'event');
  assert.equal(json.timeline[0].name, 'survey.x');
  assert.equal(json.timeline[0].via, 'sendBeacon');
  assert.equal(json.timeline[0].frame, 'top');
});

test('a batched payload produces one entry per event', () => {
  const s = createSession({});
  const body = 'data=' + b64([{ event: 'one', properties: {} }, { event: 'two', properties: {} }]);
  s.addRaw({ kind: 'raw', via: 'fetch', url: 'https://x/track/', body }, 'top');
  assert.equal(s.toJSON().timeline.length, 2);
});

test('non-analytics traffic is dropped entirely', () => {
  const s = createSession({});
  s.addRaw({ kind: 'raw', via: 'fetch', url: 'https://api/surveys', body: '{"id":1}' }, 'top');
  assert.equal(s.toJSON().timeline.length, 0);
  assert.equal(s.toJSON().meta.signalDetected, false);
});

test('navigation is a first-class action entry', () => {
  const s = createSession({});
  s.addNavigation('https://a/one', 'https://a/two');
  const [entry] = s.toJSON().timeline;
  assert.equal(entry.kind, 'action');
  assert.equal(entry.type, 'navigate');
  assert.equal(entry.from, 'https://a/one');
  assert.equal(entry.to, 'https://a/two');
});

test('screens accumulate with incrementing ids', () => {
  const s = createSession({});
  s.addScreen({ url: 'https://a/one', inventory: [] });
  s.addScreen({ url: 'https://a/two', inventory: [{ id: 1 }] });
  const { screens } = s.toJSON();
  assert.deepEqual(screens.map((x) => x.screenId), [1, 2]);
  assert.equal(screens[1].inventory.length, 1);
});

test('seq increments across every entry kind', () => {
  const s = createSession({});
  s.addRaw({ kind: 'action', type: 'click', el: { tag: 'button' } }, 'top');
  s.addNavigation('a', 'b');
  s.addRaw({ kind: 'raw', url: 'https://x/track/', body: trackBody('e') }, 'top');
  assert.deepEqual(s.toJSON().timeline.map((e) => e.seq), [1, 2, 3]);
});

test('an auto-clicked action keeps origin auto; manual is the default', () => {
  const s = createSession({});
  s.addRaw({ kind: 'action', type: 'click', el: { tag: 'button' }, origin: 'auto' }, 'top');
  s.addRaw({ kind: 'action', type: 'click', el: { tag: 'button' } }, 'top');
  const [auto, manual] = s.toJSON().timeline;
  assert.equal(auto.origin, 'auto');
  assert.equal(manual.origin, 'manual');
});

test('hooksArmed records which transports actually fired', () => {
  const s = createSession({});
  s.addRaw({ kind: 'raw', via: 'sendBeacon', url: 'https://x/track/', body: trackBody('a') }, 'top');
  s.addRaw({ kind: 'bridge', name: 'click_x', props: {} }, 'iframe');
  assert.deepEqual(s.toJSON().meta.hooksArmed.sort(), ['bridge', 'sendBeacon']);
});
