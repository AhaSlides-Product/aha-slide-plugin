import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decodeRecord, looksLikeTracking } from '../decode.mjs';

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64');

test('decodes base64 data= form bodies', () => {
  const body = 'data=' + b64({ event: 'survey.publish', properties: { survey_id: 1 } });
  const out = decodeRecord({ kind: 'raw', via: 'sendBeacon', url: 'https://x/track/', body });
  assert.deepEqual(out, [{ name: 'survey.publish', props: { survey_id: 1 } }]);
});

test('decodes url-encoded JSON data= bodies', () => {
  const json = JSON.stringify({ event: 'a', properties: { b: 2 } });
  const body = 'data=' + encodeURIComponent(json);
  const out = decodeRecord({ kind: 'raw', via: 'fetch', url: 'https://x/track/', body });
  assert.deepEqual(out, [{ name: 'a', props: { b: 2 } }]);
});

test('decodes a raw JSON body', () => {
  const body = JSON.stringify({ event: 'a', properties: {} });
  const out = decodeRecord({ kind: 'raw', via: 'xhr', url: 'https://x/track/', body });
  assert.deepEqual(out, [{ name: 'a', props: {} }]);
});

test('decodes a batched array into several events', () => {
  const body = 'data=' + b64([
    { event: 'one', properties: { i: 1 } },
    { event: 'two', properties: { i: 2 } },
  ]);
  const out = decodeRecord({ kind: 'raw', via: 'sendBeacon', url: 'https://x/track/', body });
  assert.equal(out.length, 2);
  assert.equal(out[1].name, 'two');
});

test('passes a bridge record through unchanged', () => {
  const out = decodeRecord({ kind: 'bridge', name: 'click_submit_button', props: { a: 1 } });
  assert.deepEqual(out, [{ name: 'click_submit_button', props: { a: 1 } }]);
});

test('missing properties decode to an empty object', () => {
  const body = 'data=' + b64({ event: 'a' });
  assert.deepEqual(decodeRecord({ kind: 'raw', url: 'https://x/track/', body }), [
    { name: 'a', props: {} },
  ]);
});

test('ignores non-analytics traffic', () => {
  assert.deepEqual(
    decodeRecord({ kind: 'raw', via: 'fetch', url: 'https://api/surveys', body: '{"id":1}' }),
    [],
  );
});

test('ignores an unparseable body on a tracking URL', () => {
  assert.deepEqual(
    decodeRecord({ kind: 'raw', via: 'fetch', url: 'https://x/track/', body: 'not json' }),
    [],
  );
});

test('looksLikeTracking recognises track, engage and data= bodies', () => {
  assert.equal(looksLikeTracking('https://x/track/', null), true);
  assert.equal(looksLikeTracking('https://x/engage/', null), true);
  assert.equal(looksLikeTracking('https://x/anything', 'data=abc'), true);
  assert.equal(looksLikeTracking('https://x/api/surveys', '{"a":1}'), false);
});
