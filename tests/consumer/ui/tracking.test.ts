import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { vEmitAction, emitActionDirective, emitActionPlugin } from '@aha/ui';

describe('@aha/ui - Tracking', () => {
  describe('vEmitAction', () => {
    beforeEach(() => {
      (window as any).xprops = {
        trackGA4AndMixpanel: vi.fn(),
      };
    });

    it('should call trackGA4AndMixpanel on click', async () => {
      const payload = { category: 'ui', action: 'click', label: 'test' };
      const TestComponent = defineComponent({
        directives: { emitAction: vEmitAction },
        setup() {
          return { payload };
        },
        template: '<button v-emit-action="payload">Click me</button>',
      });

      const wrapper = mount(TestComponent);
      await wrapper.find('button').trigger('click');

      expect((window as any).xprops.trackGA4AndMixpanel).toHaveBeenCalledWith(payload);
    });

    it('should update payload when binding value changes', async () => {
      const TestComponent = defineComponent({
        directives: { emitAction: vEmitAction },
        data() {
          return { payload: { val: 1 } };
        },
        template: '<button v-emit-action="payload">Click me</button>',
      });

      const wrapper = mount(TestComponent);
      await wrapper.setData({ payload: { val: 2 } });
      await wrapper.find('button').trigger('click');

      expect((window as any).xprops.trackGA4AndMixpanel).toHaveBeenCalledWith({ val: 2 });
    });
  });

  describe('emitActionDirective (v-aha-emit-action)', () => {
    beforeEach(() => {
      (window as any).xprops = {
        trackGA4AndMixpanel: vi.fn(),
      };
      // Mock IntersectionObserver
      global.IntersectionObserver = vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      }));
    });

    it('should track click events with generated event name', async () => {
      const TestComponent = defineComponent({
        directives: { ahaEmitAction: emitActionDirective },
        template: '<button v-aha-emit-action name="submit-btn" aha-other-info="footer">Click me</button>',
      });

      const wrapper = mount(TestComponent);
      await wrapper.find('button').trigger('click');

      // eventName = action_objectName_otherInfo = click_submit_btn_footer
      expect((window as any).xprops.trackGA4AndMixpanel).toHaveBeenCalledWith(
        'click_submit_btn_footer',
        expect.objectContaining({ eventAction: 'click_submit_btn_footer' })
      );
    });

    it('should track view events using IntersectionObserver', () => {
      const TestComponent = defineComponent({
        directives: { ahaEmitAction: emitActionDirective },
        template: '<div v-aha-emit-action.view name="hero">Visible</div>',
      });

      mount(TestComponent);
      expect(global.IntersectionObserver).toHaveBeenCalled();
    });

    it('should support custom properties in binding value', async () => {
      const TestComponent = defineComponent({
        directives: { ahaEmitAction: emitActionDirective },
        template: '<button v-aha-emit-action="{ customProp: \'val\' }" name="btn">Click</button>',
      });

      const wrapper = mount(TestComponent);
      await wrapper.find('button').trigger('click');

      expect((window as any).xprops.trackGA4AndMixpanel).toHaveBeenCalledWith(
        'click_btn',
        expect.objectContaining({ customProp: 'val' })
      );
    });
  });

  describe('emitActionPlugin', () => {
    it('should be a valid Vue plugin', () => {
      expect(emitActionPlugin).toHaveProperty('install');
      expect(typeof emitActionPlugin.install).toBe('function');
    });
  });
});
