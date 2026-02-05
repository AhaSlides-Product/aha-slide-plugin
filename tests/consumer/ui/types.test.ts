import { describe, it, expect } from 'vitest';
import type {
  SlidePluginProps,
  AudienceSlidePluginProps,
  ImageUploadResult,
  UseSlidePluginOptions,
  BaseSlidePluginProps,
  PluginKeyboardEvent,
  BaseSlidePluginReturn,
  ReportProps,
  ReportReturn,
  TrackingElement,
} from '@aha/ui';

/**
 * Phase 3: Type tests for @aha/ui
 * 
 * These tests verify that TypeScript types match runtime behavior
 * and that interfaces have the expected structure.
 */
describe('@aha/ui - Types', () => {
  describe('ImageUploadResult', () => {
    it('should have required path and url properties', () => {
      const result: ImageUploadResult = {
        path: '/static/images/icon.svg',
        url: 'https://cdn.example.com/images/icon.svg',
      };
      expect(result.path).toBe('/static/images/icon.svg');
      expect(result.url).toBe('https://cdn.example.com/images/icon.svg');
    });

    it('should allow additional properties', () => {
      const result: ImageUploadResult = {
        path: '/path',
        url: 'https://url',
        width: 100,
        height: 200,
        metadata: { size: 1024 },
      };
      expect(result.width).toBe(100);
      expect(result.height).toBe(200);
      expect((result as any).metadata).toEqual({ size: 1024 });
    });
  });

  describe('UseSlidePluginOptions', () => {
    it('should have optional autoHeight boolean', () => {
      const options1: UseSlidePluginOptions = {};
      expect(options1.autoHeight).toBeUndefined();

      const options2: UseSlidePluginOptions = { autoHeight: true };
      expect(options2.autoHeight).toBe(true);

      const options3: UseSlidePluginOptions = { autoHeight: false };
      expect(options3.autoHeight).toBe(false);
    });
  });

  describe('BaseSlidePluginProps', () => {
    it('should have required url property', () => {
      const props: BaseSlidePluginProps = {
        url: 'https://example.com/plugin',
      };
      expect(props.url).toBe('https://example.com/plugin');
    });

    it('should have optional presentation property', () => {
      const props: BaseSlidePluginProps = {
        url: 'https://example.com',
        presentation: {
          id: '123',
          language: 'en',
        },
      };
      expect(props.presentation?.id).toBe('123');
      expect(props.presentation?.language).toBe('en');
    });

    it('should have optional slide property', () => {
      const props: BaseSlidePluginProps = {
        url: 'https://example.com',
        slide: {
          id: '456',
          version: 1,
        },
      };
      expect(props.slide?.id).toBe('456');
      expect(props.slide?.version).toBe(1);
    });

    it('should have optional baseUrl property', () => {
      const props: BaseSlidePluginProps = {
        url: 'https://example.com',
        baseUrl: 'https://api.example.com',
      };
      expect(props.baseUrl).toBe('https://api.example.com');
    });

    it('should have optional onHeightChange, subscribeTopic, unsubscribeTopic', () => {
      const props: BaseSlidePluginProps = {
        url: 'https://example.com',
        onHeightChange: () => {},
        subscribeTopic: () => {},
        unsubscribeTopic: () => {},
      };
      expect(typeof props.onHeightChange).toBe('function');
      expect(typeof props.subscribeTopic).toBe('function');
      expect(typeof props.unsubscribeTopic).toBe('function');
    });

    it('should have optional presentationColorPalette and presentationLighterColorPalette', () => {
      const props: BaseSlidePluginProps = {
        url: 'https://example.com',
        presentationColorPalette: ['#fff', '#000'],
        presentationLighterColorPalette: ['#f0f0f0'],
      };
      expect(props.presentationColorPalette).toEqual(['#fff', '#000']);
      expect(props.presentationLighterColorPalette).toEqual(['#f0f0f0']);
    });
  });

  describe('PluginKeyboardEvent', () => {
    it('should have key, code, ctrlKey, shiftKey, keyCode', () => {
      const event: PluginKeyboardEvent = {
        key: 'Enter',
        code: 'Enter',
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        repeat: false,
        location: 0,
        keyCode: 13,
      };
      expect(event.key).toBe('Enter');
      expect(event.code).toBe('Enter');
      expect(event.ctrlKey).toBe(false);
      expect(event.shiftKey).toBe(false);
      expect(event.keyCode).toBe(13);
    });
  });

  describe('BaseSlidePluginReturn', () => {
    it('should describe hook return shape (refs and optional actions)', () => {
      // Type-only: we verify the shape is usable
      const ret: BaseSlidePluginReturn = {
        presentationProps: { value: undefined } as any,
        presentationColorPaletteProps: { value: undefined } as any,
        presentationLighterColorPaletteProps: { value: undefined } as any,
        slideProps: { value: undefined } as any,
        baseUrl: { value: undefined } as any,
        subscribeTopic: undefined,
        unsubscribeTopic: undefined,
        audienceSendCountingUniqueAction: undefined,
      };
      expect(ret.presentationProps).toBeDefined();
      expect(ret.slideProps).toBeDefined();
      expect(ret.baseUrl).toBeDefined();
    });
  });

  describe('ReportProps', () => {
    it('should have optional token, currentLanguage, onHeightChange', () => {
      const props: ReportProps = {
        token: 'abc',
        currentLanguage: 'en',
        onHeightChange: () => {},
      };
      expect(props.token).toBe('abc');
      expect(props.currentLanguage).toBe('en');
      expect(typeof props.onHeightChange).toBe('function');
    });

    it('should have optional trackGA4AndMixpanel, changeRoute, pushRoute', () => {
      const props: ReportProps = {
        trackGA4AndMixpanel: () => {},
        changeRoute: () => {},
        pushRoute: () => {},
      };
      expect(typeof props.trackGA4AndMixpanel).toBe('function');
      expect(typeof props.changeRoute).toBe('function');
      expect(typeof props.pushRoute).toBe('function');
    });
  });

  describe('ReportReturn', () => {
    it('should describe report hook return shape', () => {
      const ret: ReportReturn = {
        token: { value: undefined } as any,
        currentLanguage: { value: undefined } as any,
        trackGA4AndMixpanel: undefined,
        changeRoute: undefined,
        pushRoute: undefined,
      };
      expect(ret.token).toBeDefined();
      expect(ret.currentLanguage).toBeDefined();
    });
  });

  describe('TrackingElement', () => {
    it('should extend HTMLElement with optional tracking payload', () => {
      const el = document.createElement('div') as TrackingElement;
      expect(el.tagName).toBe('DIV');
      el._trackingPayload = { category: 'ui', action: 'click' };
      el._emitActionHandler = () => {};
      expect(el._trackingPayload).toEqual({ category: 'ui', action: 'click' });
      expect(typeof el._emitActionHandler).toBe('function');
    });
  });

  describe('SlidePluginProps', () => {
    it('should extend BaseSlidePluginProps', () => {
      const props: SlidePluginProps = {
        url: 'https://example.com',
        presentation: { id: '1' },
        slide: { id: '2' },
        uploadImage: async () => ({ path: '/path', url: 'https://url' }),
      };
      expect(props.url).toBe('https://example.com');
      expect(props.presentation?.id).toBe('1');
      expect(props.slide?.id).toBe('2');
    });

    it('should have optional getSlideAttributesAction', () => {
      const props: SlidePluginProps = {
        url: 'https://example.com',
        getSlideAttributesAction: async () => ({}),
        uploadImage: async () => ({ path: '/path', url: 'https://url' }),
      };
      expect(typeof props.getSlideAttributesAction).toBe('function');
    });

    it('should have optional uploadImage', () => {
      const props: SlidePluginProps = {
        url: 'https://example.com',
        uploadImage: async () => ({ path: '/path', url: 'https://url' }),
      };
      expect(typeof props.uploadImage).toBe('function');
    });

    it('should have optional onKeyboard, emitKeyboardEvent, showToast*', () => {
      const props: SlidePluginProps = {
        url: 'https://example.com',
        uploadImage: async () => ({ path: '/path', url: 'https://url' }),
        onKeyboard: () => {},
        emitKeyboardEvent: () => {},
        showToastInfo: () => {},
        showToastSuccess: () => {},
        showToastError: () => {},
      };
      expect(typeof props.onKeyboard).toBe('function');
      expect(typeof props.emitKeyboardEvent).toBe('function');
      expect(typeof props.showToastInfo).toBe('function');
    });
  });

  describe('AudienceSlidePluginProps', () => {
    it('should extend BaseSlidePluginProps', () => {
      const props: AudienceSlidePluginProps = {
        url: 'https://example.com',
        presentation: { id: '1' },
        slide: { id: '2' },
      };
      expect(props.url).toBe('https://example.com');
    });

    it('should have optional audience-specific properties', () => {
      const props: AudienceSlidePluginProps = {
        url: 'https://example.com',
        audienceName: 'Alice',
        audienceEmoji: '👍',
        audienceId: 'aud-123',
        audienceEmail: 'alice@example.com',
        audienceTeam: 'Team A',
        slideAttributes: { custom: 'data' },
      };
      expect(props.audienceName).toBe('Alice');
      expect(props.audienceEmoji).toBe('👍');
      expect(props.audienceId).toBe('aud-123');
      expect(props.audienceEmail).toBe('alice@example.com');
      expect(props.audienceTeam).toBe('Team A');
      expect(props.slideAttributes).toEqual({ custom: 'data' });
    });

    it('should have optional uploadImage and showToast*', () => {
      const props: AudienceSlidePluginProps = {
        url: 'https://example.com',
        uploadImage: async () => ({}),
        showToastInfo: () => {},
        showToastSuccess: () => {},
        showToastError: () => {},
      };
      expect(typeof props.uploadImage).toBe('function');
      expect(typeof props.showToastInfo).toBe('function');
    });
  });

  describe('Type Compatibility', () => {
    it('should allow BaseSlidePluginProps to be used where SlidePluginProps is expected', () => {
      const baseProps: BaseSlidePluginProps = {
        url: 'https://example.com',
        presentation: { id: '1' },
      };
      // SlidePluginProps extends BaseSlidePluginProps, so baseProps should be compatible
      const slideProps: SlidePluginProps = baseProps as SlidePluginProps;
      expect(slideProps.url).toBe('https://example.com');
    });

    it('should allow BaseSlidePluginProps to be used where AudienceSlidePluginProps is expected', () => {
      const baseProps: BaseSlidePluginProps = {
        url: 'https://example.com',
      };
      const audienceProps: AudienceSlidePluginProps = baseProps as AudienceSlidePluginProps;
      expect(audienceProps.url).toBe('https://example.com');
    });
  });
});
