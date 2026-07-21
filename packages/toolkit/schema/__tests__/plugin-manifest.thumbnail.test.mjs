import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Ajv = require('ajv/dist/2020');
const schema = require('../plugin-manifest.schema.json');

const ajv = new Ajv({ allErrors: true });

const base = {
  id: 'test-plugin',
  name: 'Test Plugin',
  baseUrl: 'https://example.com',
  staticTabs: [{ contentUrl: '/tab', context: 'editor' }],
  slideTypes: [
    {
      type: 'testSlide',
      name: 'Test Slide',
      canvasUrl: 'https://example.com/canvas',
      settingUrl: 'https://example.com/setting',
      audienceUrl: 'https://example.com/audience',
    },
  ],
};

test('thumbnail mode static requires thumbnailUrl', () => {
  const validate = ajv.compile(schema);

  const bad = structuredClone(base);
  bad.slideTypes[0].thumbnail = { mode: 'static' }; // missing thumbnailUrl
  assert.equal(validate(bad), false, 'static without thumbnailUrl should fail');

  const good = structuredClone(base);
  good.slideTypes[0].thumbnail = { mode: 'static', thumbnailUrl: 'https://example.com/thumb.png' };
  assert.equal(validate(good), true, 'static with thumbnailUrl should pass');
});

test('thumbnail mode snapshot and icon need no url', () => {
  const validate = ajv.compile(schema);

  for (const mode of ['icon', 'snapshot']) {
    const m = structuredClone(base);
    m.slideTypes[0].thumbnail = { mode };
    assert.equal(validate(m), true, `mode=${mode} should be valid without thumbnailUrl`);
  }
});

test('thumbnail is optional (existing manifests without it remain valid)', () => {
  const validate = ajv.compile(schema);
  const m = structuredClone(base);
  // No thumbnail field at all
  assert.equal(validate(m), true, 'slide type without thumbnail should still be valid');
});

test('empty thumbnail object is valid and defaults to icon mode', () => {
  const validate = ajv.compile(schema);
  const m = structuredClone(base);
  m.slideTypes[0].thumbnail = {}; // mode omitted → schema default "icon"
  assert.equal(validate(m), true, 'thumbnail: {} should be valid (mode defaults to icon)');
});

test('thumbnail rejects unknown mode values', () => {
  const validate = ajv.compile(schema);
  const m = structuredClone(base);
  m.slideTypes[0].thumbnail = { mode: 'unknown' };
  assert.equal(validate(m), false, 'unknown mode should fail');
});

test('thumbnail mode static rejects empty thumbnailUrl', () => {
  const validate = ajv.compile(schema);
  const m = structuredClone(base);
  m.slideTypes[0].thumbnail = { mode: 'static', thumbnailUrl: '' };
  assert.equal(validate(m), false, 'static with empty thumbnailUrl should fail');
});
