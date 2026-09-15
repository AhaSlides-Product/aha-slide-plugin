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
  slideTypes: [{
    type: 'testSlide',
    name: 'Test Slide',
    canvasUrl: 'https://example.com/canvas',
    settingUrl: 'https://example.com/setting',
    audienceUrl: 'https://example.com/audience',
  }],
};

const withThumbnail = (thumbnail) => {
  const m = structuredClone(base);
  m.slideTypes[0].thumbnail = thumbnail;
  return m;
};

test('thumbnail is optional (existing manifests stay valid)', () => {
  const validate = ajv.compile(schema);
  assert.equal(validate(structuredClone(base)), true);
});

test('thumbnail mode icon needs nothing else; unknown modes are rejected', () => {
  const validate = ajv.compile(schema);
  assert.equal(validate(withThumbnail({ mode: 'icon' })), true);
  assert.equal(validate(withThumbnail({ mode: 'snapshot' })), false);
  assert.equal(validate(withThumbnail({})), false, 'mode is required');
});

test('thumbnail mode iframe requires iframeUrl and accepts attributeKeys', () => {
  const validate = ajv.compile(schema);
  assert.equal(validate(withThumbnail({ mode: 'iframe' })), false, 'iframe without iframeUrl should fail');
  const good = withThumbnail({ mode: 'iframe', iframeUrl: 'https://example.com/preview', attributeKeys: ['dsl'] });
  assert.equal(validate(good), true, `iframe with iframeUrl should pass: ${JSON.stringify(validate.errors)}`);
});

test('thumbnail iframeUrl must be non-empty and attributeKeys must be strings', () => {
  const validate = ajv.compile(schema);
  assert.equal(validate(withThumbnail({ mode: 'iframe', iframeUrl: '' })), false);
  assert.equal(validate(withThumbnail({ mode: 'iframe', iframeUrl: 'https://example.com/preview', attributeKeys: [1] })), false);
  assert.equal(validate(withThumbnail({ mode: 'iframe', iframeUrl: 'https://example.com/preview', extra: true })), false, 'no unknown keys');
});
