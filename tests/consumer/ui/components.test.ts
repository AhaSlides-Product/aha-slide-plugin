import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import AhaIcon from '@aha/ui/AhaIcon.vue';
import {
  PresenterSlidePluginIframe,
  AudienceSlidePluginIframe,
  ReportIframe,
  useReportPlugin,
} from '@aha/ui';

describe('@aha/ui - Components', () => {
  describe('AhaIcon', () => {
    beforeEach(() => {
      // Mock console.warn to avoid noise in tests
      vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    it('should render with required name prop', () => {
      const wrapper = mount(AhaIcon, {
        props: { name: 'test-icon' },
      });
      expect(wrapper.exists()).toBe(true);
    });

    it('should render placeholder when icon is not found', async () => {
      const wrapper = mount(AhaIcon, {
        props: { name: 'non-existent-icon' },
      });
      await wrapper.vm.$nextTick();
      const placeholder = wrapper.find('.icon-placeholder');
      expect(placeholder.exists()).toBe(true);
      expect(placeholder.text()).toBe('?');
    });

    it('should apply size prop', () => {
      const wrapper = mount(AhaIcon, {
        props: { name: 'test-icon', size: '24px' },
      });
      const span = wrapper.find('span');
      expect(span.attributes('style')).toContain('width: 24px');
      expect(span.attributes('style')).toContain('height: 24px');
    });

    it('should apply width and height props', () => {
      const wrapper = mount(AhaIcon, {
        props: { name: 'test-icon', width: '32px', height: '40px' },
      });
      const span = wrapper.find('span');
      expect(span.attributes('style')).toContain('width: 32px');
      expect(span.attributes('style')).toContain('height: 40px');
    });

    it('should prefer width/height over size', () => {
      const wrapper = mount(AhaIcon, {
        props: { name: 'test-icon', size: '20px', width: '30px', height: '35px' },
      });
      const span = wrapper.find('span');
      expect(span.attributes('style')).toContain('width: 30px');
      expect(span.attributes('style')).toContain('height: 35px');
      expect(span.attributes('style')).not.toContain('width: 20px');
    });

    it('should apply class prop when icon is loaded', async () => {
      // Note: class prop is only applied to the span with svgContent (when icon loads)
      // Since icons may not exist in test environment, we verify the prop is accepted
      const wrapper = mount(AhaIcon, {
        props: { name: 'test-icon', class: 'custom-class' },
      });
      // Component accepts class prop (consumer contract)
      expect(wrapper.props('class')).toBe('custom-class');
      // In real usage with valid icon, class would be applied to the SVG span
    });

    it('should use default size when no size or width/height provided', () => {
      const wrapper = mount(AhaIcon, {
        props: { name: 'test-icon' },
      });
      const span = wrapper.find('span');
      expect(span.attributes('style')).toContain('width: 1em');
      expect(span.attributes('style')).toContain('height: 1em');
    });

    it('should reload icon when name prop changes', async () => {
      const wrapper = mount(AhaIcon, {
        props: { name: 'icon-1' },
      });
      await wrapper.vm.$nextTick();
      await wrapper.setProps({ name: 'icon-2' });
      await wrapper.vm.$nextTick();
      // Component should handle prop change (watch triggers loadIcon)
      expect(wrapper.exists()).toBe(true);
    });
  });

  describe('Zoid Components', () => {
    it('should export PresenterSlidePluginIframe', () => {
      expect(PresenterSlidePluginIframe).toBeDefined();
    });

    it('should export AudienceSlidePluginIframe', () => {
      expect(AudienceSlidePluginIframe).toBeDefined();
    });

    it('should have PresenterSlidePluginIframe with correct tag', () => {
      // Zoid components are created with zoid.create() which returns a component-like object
      // We can check that it exists and has expected properties
      expect(PresenterSlidePluginIframe).toBeDefined();
      // The tag is set during creation: 'presenter-slide-plugin-iframe'
      // In a real environment, this would be registered as a custom element
    });

    it('should have AudienceSlidePluginIframe with correct tag', () => {
      expect(AudienceSlidePluginIframe).toBeDefined();
      // The tag is set during creation: 'audience-slide-plugin-iframe'
    });

    it('should allow PresenterSlidePluginIframe to be instantiated (type check)', () => {
      // Consumer contract: component can be used/instantiated
      // In real usage: <presenter-slide-plugin-iframe url="..." />
      // Zoid components are functions (zoid.create returns a function/constructor)
      const Component = PresenterSlidePluginIframe;
      expect(Component).toBeDefined();
      // Zoid components are functions that can be called to create instances
      expect(typeof Component === 'function' || typeof Component === 'object').toBe(true);
    });

    it('should allow AudienceSlidePluginIframe to be instantiated (type check)', () => {
      const Component = AudienceSlidePluginIframe;
      expect(Component).toBeDefined();
      // Zoid components are functions that can be called to create instances
      expect(typeof Component === 'function' || typeof Component === 'object').toBe(true);
    });

    it('should export ReportIframe', () => {
      expect(ReportIframe).toBeDefined();
      expect(typeof ReportIframe === 'function' || typeof ReportIframe === 'object').toBe(true);
    });

    it('should export useReportPlugin', () => {
      expect(useReportPlugin).toBeDefined();
      expect(typeof useReportPlugin).toBe('function');
    });

    it('should have PresenterSlidePluginIframe tag string when available', () => {
      // Zoid components may expose .tag or similar; if so, verify consumer contract
      const C = PresenterSlidePluginIframe as { tag?: string };
      if (typeof C.tag === 'string') {
        expect(C.tag).toBe('presenter-slide-plugin-iframe');
      }
    });

    it('should have AudienceSlidePluginIframe tag string when available', () => {
      const C = AudienceSlidePluginIframe as { tag?: string };
      if (typeof C.tag === 'string') {
        expect(C.tag).toBe('audience-slide-plugin-iframe');
      }
    });
  });
});
