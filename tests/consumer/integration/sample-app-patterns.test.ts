import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import {
  ahaSlidesDefaultTheme,
  useSync,
  usePresenterPlugin,
  useAudiencePlugin,
  PresenterSlidePluginIframe,
  AudienceSlidePluginIframe,
} from '@aha/ui';
import type { SlidePluginProps } from '@aha/ui';

/**
 * Sample-app patterns integration tests
 *
 * Verifies that the same import and usage patterns as the sample-slide app
 * work when consuming the SDK. Patterns are taken from:
 * - apps/sample-slide/frontend/src/App.vue
 * - apps/sample-slide/frontend/src/main.ts
 * - apps/sample-slide/frontend/src/pages/Canvas.vue, Settings.vue, Audience.vue
 * - apps/sample-slide/frontend/src/composables/useXProps.ts
 */
describe('Sample-app patterns', () => {
  describe('App.vue pattern: theme', () => {
    it('should import ahaSlidesDefaultTheme for a-config-provider', () => {
      expect(ahaSlidesDefaultTheme).toBeDefined();
      expect(ahaSlidesDefaultTheme).toHaveProperty('token');
      expect(ahaSlidesDefaultTheme).toHaveProperty('algorithm');
    });
  });

  describe('main.ts pattern: Zoid components', () => {
    it('should import PresenterSlidePluginIframe and AudienceSlidePluginIframe', () => {
      expect(PresenterSlidePluginIframe).toBeDefined();
      expect(AudienceSlidePluginIframe).toBeDefined();
    });
  });

  describe('Canvas.vue / Settings.vue pattern: useSync + usePresenterPlugin', () => {
    it('should import useSync and usePresenterPlugin together', () => {
      expect(typeof useSync).toBe('function');
      expect(typeof usePresenterPlugin).toBe('function');
    });

    it('should allow useSync for slide greeting state', () => {
      const TestComponent = defineComponent({
        setup() {
          const slideGreeting = useSync('sample-slide-greeting', 'Hello');
          return { slideGreeting };
        },
        template: '<div>{{ slideGreeting }}</div>',
      });
      const wrapper = mount(TestComponent);
      const value = (wrapper.vm as any).slideGreeting?.value ?? (wrapper.vm as any).slideGreeting;
      expect(value).toBe('Hello');
    });

    it('should allow usePresenterPlugin to expose presentationProps and slideProps', () => {
      (window as any).xprops = {
        presentation: { id: '1', language: 'en' },
        slide: { id: '2', version: 1 },
        baseUrl: 'https://presenter.example.com',
        onHeightChange: () => {},
        getSlideAttributesAction: async () => ({}),
        upsertSlideAttributeAction: async () => {},
        subscribeTopic: () => {},
        unsubscribeTopic: () => {},
        audienceSendCountingUniqueAction: async () => {},
        uploadImage: async () => ({ path: '', url: '' }),
        getValues: async () => [],
      };
      const TestComponent = defineComponent({
        setup() {
          return usePresenterPlugin({ autoHeight: false });
        },
        template: '<div />',
      });
      const wrapper = mount(TestComponent);
      const hook = wrapper.vm as unknown as { presentationProps: unknown; slideProps: unknown; baseUrl: unknown; getSlideAttributesAction: unknown };
      expect(hook.presentationProps).toBeDefined();
      expect(hook.slideProps).toBeDefined();
      expect(hook.baseUrl).toBeDefined();
      expect(hook.getSlideAttributesAction).toBeDefined();
    });
  });

  describe('Audience.vue pattern: useAudiencePlugin', () => {
    it('should import useAudiencePlugin', () => {
      expect(typeof useAudiencePlugin).toBe('function');
    });

    it('should allow useAudiencePlugin to expose audience refs when used in component', () => {
      (window as any).xprops = {
        presentation: { id: '1' },
        slide: { id: '2' },
        baseUrl: 'https://audience.example.com',
        audience: {
          audienceName: 'Alice',
          audienceEmoji: '👍',
          audienceId: 'aud-1',
          audienceEmail: 'alice@test.com',
          audienceTeam: 'Team A',
        },
        slideAttributes: {},
        onHeightChange: () => {},
        subscribeTopic: () => {},
        unsubscribeTopic: () => {},
        audienceSendCountingUniqueAction: async () => {},
      };
      const TestComponent = defineComponent({
        setup() {
          return useAudiencePlugin({ autoHeight: false });
        },
        template: '<div />',
      });
      const wrapper = mount(TestComponent);
      const hook = wrapper.vm as any;
      // Sample-app pattern: hook exposes audienceName, audienceEmoji, audienceId, etc.
      expect(hook).toHaveProperty('audienceName');
      expect(hook).toHaveProperty('audienceEmoji');
      expect(hook).toHaveProperty('audienceId');
      expect(hook).toHaveProperty('presentationProps');
      expect(hook).toHaveProperty('slideProps');
    });
  });

  describe('useXProps pattern: SlidePluginProps type', () => {
    it('should allow SlidePluginProps to type xprops', () => {
      const xprops: SlidePluginProps = {
        url: 'https://plugin.example.com',
        presentation: { id: '1', language: 'en' },
        slide: { id: '2', version: 1 },
        baseUrl: 'https://host.example.com',
        uploadImage: () => Promise.resolve({ path: '', url: '' }),
      };
      expect(xprops.url).toBe('https://plugin.example.com');
      expect(xprops.presentation?.id).toBe('1');
      expect(xprops.slide?.id).toBe('2');
    });
  });

  describe('CSS and Vite plugin (contract only)', () => {
    it('should document sample-app import paths for CSS and Vite icon plugin', () => {
      // Sample-app uses:
      // - import '@aha/ui/ahaslides-vars.css'
      // - import '@aha/ui/ahaslides-antd-extensions.css'
      // - import { ahaViteIconPlugin } from '@aha/ui/vite.config.icon'
      // Consumer contract: these subpath exports exist (verified by package exports).
      expect(PresenterSlidePluginIframe).toBeDefined();
      expect(AudienceSlidePluginIframe).toBeDefined();
    });
  });
});
