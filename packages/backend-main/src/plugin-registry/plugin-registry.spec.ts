import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PluginRegistryController } from './plugin-registry.controller';
import { PluginRegistryService } from './plugin-registry.service';
import { REGISTRY_SEED } from './plugin-registry.seed';
import type { PluginDescriptor } from './plugin-registry.types';

const validEmbed: PluginDescriptor = {
  id: 'my-embed',
  kind: 'embed',
  name: 'My Embed',
  version: '1.0.0',
  payload: { baseUrl: 'https://example.pages.dev' },
};

const validSlide: PluginDescriptor = {
  id: 'my-slide',
  kind: 'slide',
  name: 'My Slide',
  version: '2.1.0',
  payload: { type: 'my-slide', canvasUrl: 'https://example.com/canvas' },
};

describe('Plugin Registry > Service', () => {
  let service: PluginRegistryService;
  let controller: PluginRegistryController;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [PluginRegistryController],
      providers: [PluginRegistryService],
    }).compile();

    service = moduleRef.get(PluginRegistryService);
    controller = moduleRef.get(PluginRegistryController);
  });

  test('Verify that list returns the seeded FAB AI Chatbot embed descriptor', () => {
    const chatbot = service.list().find(p => p.id === 'ai-chatbot');
    expect(chatbot).toEqual({
      id: 'ai-chatbot',
      kind: 'embed',
      name: 'AI Chatbot (FAB)',
      version: 'fab',
      payload: { baseUrl: 'https://fab.aha-claude-assistant-sandbox.pages.dev' },
    });
  });

  test('Verify that GET list returns the { plugins: [...] } shape the presenter accepts', () => {
    const body = controller.list();
    expect(Array.isArray(body.plugins)).toBe(true);
    expect(body.plugins.length).toBe(REGISTRY_SEED.length);
    expect(body.plugins[0].id).toBe('ai-chatbot');
  });

  test('Verify that register upserts a valid embed descriptor into the listing', () => {
    service.register(validEmbed);
    const ids = service.list().map(p => p.id);
    expect(ids).toContain('ai-chatbot');
    expect(ids).toContain('my-embed');
  });

  test('Verify that register upserts a valid slide descriptor', () => {
    const stored = service.register(validSlide);
    expect(stored).toEqual(validSlide);
    expect(service.list().find(p => p.id === 'my-slide')).toEqual(validSlide);
  });

  test('Verify that re-registering the same kind+id replaces the previous entry, not duplicates it', () => {
    service.register(validEmbed);
    const swapped = { ...validEmbed, payload: { baseUrl: 'https://swapped.pages.dev' } };
    service.register(swapped);
    const matches = service.list().filter(p => p.kind === 'embed' && p.id === 'my-embed');
    expect(matches).toHaveLength(1);
    expect((matches[0].payload as { baseUrl: string }).baseUrl).toBe('https://swapped.pages.dev');
  });

  test('Verify that register does not mutate the durable committed seed', () => {
    service.register(validEmbed);
    // A fresh service (fresh overlay) must still see only the seed.
    const fresh = new PluginRegistryService();
    expect(fresh.list()).toHaveLength(REGISTRY_SEED.length);
  });
});

describe('Plugin Registry > Validation', () => {
  let service: PluginRegistryService;

  beforeEach(() => {
    service = new PluginRegistryService();
  });

  const invalidCases: Array<[string, unknown]> = [
    ['a non-object body', 'not-an-object'],
    ['an empty id', { ...validEmbed, id: '' }],
    ['an unknown kind', { ...validEmbed, kind: 'widget' }],
    ['a missing name', { ...validEmbed, name: '' }],
    ['a missing version', { ...validEmbed, version: '' }],
    ['a non-object payload', { ...validEmbed, payload: 'x' }],
    ['an embed with no baseUrl', { ...validEmbed, payload: {} }],
    ['an embed with a non-http baseUrl', { ...validEmbed, payload: { baseUrl: 'ftp://x.com' } }],
    ['an embed with a javascript: baseUrl', { ...validEmbed, payload: { baseUrl: 'javascript:alert(1)' } }],
    ['a slide with no canvasUrl', { ...validSlide, payload: { type: 't' } }],
    ['a slide with a non-http canvasUrl', { ...validSlide, payload: { type: 't', canvasUrl: 'file:///etc' } }],
    ['a slide with a non-http optional editorUrl', {
      ...validSlide,
      payload: { type: 't', canvasUrl: 'https://ok.com', editorUrl: 'ftp://x' },
    }],
  ];

  test.each(invalidCases)('Verify that register rejects %s with a 400', (_label, body) => {
    expect(() => service.register(body)).toThrow(BadRequestException);
    // A rejected descriptor never enters the listing.
    expect(service.list()).toHaveLength(REGISTRY_SEED.length);
  });
});
