import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, nextTick } from 'vue';
import {
  useParticipantReportPlugin,
  ParticipantReportPluginIframe,
} from '@aha/ui';

/**
 * Consumer tests for the ParticipantReport zoid composable and iframe component.
 * Added to cover the new participant report feature (AHA-41072 by andrew).
 */
describe('@aha/ui - useParticipantReportPlugin', () => {
  beforeEach(() => {
    (window as any).xprops = {
      answers: [{ id: '1', value: 'answer-a' }],
      onHeightChange: vi.fn(),
      onProps: vi.fn(),
    };
  });

  it('should return initial answers from xprops', () => {
    const TestComponent = defineComponent({
      setup() {
        const hook = useParticipantReportPlugin({ autoHeight: false });
        return { hook };
      },
      template: '<div />',
    });
    const wrapper = mount(TestComponent);
    expect(wrapper.vm.hook.answers.value).toEqual([{ id: '1', value: 'answer-a' }]);
  });

  it('should return answers as undefined when xprops provides no answers', () => {
    (window as any).xprops = { onHeightChange: vi.fn() };
    const TestComponent = defineComponent({
      setup() {
        const hook = useParticipantReportPlugin({ autoHeight: false });
        return { hook };
      },
      template: '<div />',
    });
    const wrapper = mount(TestComponent);
    expect(wrapper.vm.hook.answers.value).toBeUndefined();
  });

  it('should expose a reportHeight function', () => {
    const TestComponent = defineComponent({
      setup() {
        const hook = useParticipantReportPlugin({ autoHeight: false });
        return { hook };
      },
      template: '<div />',
    });
    const wrapper = mount(TestComponent);
    expect(typeof wrapper.vm.hook.reportHeight).toBe('function');
  });

  it('reportHeight should call xprops.onHeightChange with a numeric height', () => {
    const onHeightChange = vi.fn();
    (window as any).xprops = {
      answers: [],
      onHeightChange,
    };
    const TestComponent = defineComponent({
      setup() {
        const hook = useParticipantReportPlugin({ autoHeight: false });
        return { hook };
      },
      template: '<div />',
    });
    const wrapper = mount(TestComponent);
    wrapper.vm.hook.reportHeight();
    expect(onHeightChange).toHaveBeenCalledWith(expect.any(Number));
  });

  it('should call onHeightChange(null) on mount when autoHeight is false', () => {
    const onHeightChange = vi.fn();
    (window as any).xprops = { answers: [], onHeightChange };
    const TestComponent = defineComponent({
      setup() {
        useParticipantReportPlugin({ autoHeight: false });
        return {};
      },
      template: '<div />',
    });
    mount(TestComponent);
    expect(onHeightChange).toHaveBeenCalledWith(null);
  });

  it('should update answers reactively when onProps fires with new answers', async () => {
    let onPropsCallback: ((props: any) => void) | undefined;
    (window as any).xprops.onProps = vi.fn((cb: (props: any) => void) => {
      onPropsCallback = cb;
    });
    const TestComponent = defineComponent({
      setup() {
        const hook = useParticipantReportPlugin({ autoHeight: false });
        return { hook };
      },
      template: '<div />',
    });
    const wrapper = mount(TestComponent);

    onPropsCallback!({ answers: [{ id: '2', value: 'updated-answer' }] });
    await nextTick();

    expect(wrapper.vm.hook.answers.value).toEqual([{ id: '2', value: 'updated-answer' }]);
  });

  it('should not update answers when onProps fires without an answers field', async () => {
    let onPropsCallback: ((props: any) => void) | undefined;
    (window as any).xprops.onProps = vi.fn((cb: (props: any) => void) => {
      onPropsCallback = cb;
    });
    const TestComponent = defineComponent({
      setup() {
        const hook = useParticipantReportPlugin({ autoHeight: false });
        return { hook };
      },
      template: '<div />',
    });
    const wrapper = mount(TestComponent);

    onPropsCallback!({ imageUrl: 'https://example.com/image.png' });
    await nextTick();

    expect(wrapper.vm.hook.answers.value).toEqual([{ id: '1', value: 'answer-a' }]);
  });

  it('should handle missing xprops gracefully', () => {
    (window as any).xprops = undefined;
    const TestComponent = defineComponent({
      setup() {
        const hook = useParticipantReportPlugin({ autoHeight: false });
        return { hook };
      },
      template: '<div />',
    });
    expect(() => mount(TestComponent)).not.toThrow();
  });

  it('reportHeight should not throw when xprops is undefined', () => {
    (window as any).xprops = undefined;
    const TestComponent = defineComponent({
      setup() {
        const hook = useParticipantReportPlugin({ autoHeight: false });
        return { hook };
      },
      template: '<div />',
    });
    const wrapper = mount(TestComponent);
    expect(() => wrapper.vm.hook.reportHeight()).not.toThrow();
  });

  it('should NOT call onHeightChange(null) when autoHeight is true (default)', () => {
    const onHeightChange = vi.fn();
    (window as any).xprops = { answers: [], onHeightChange };

    const TestComponent = defineComponent({
      setup() {
        useParticipantReportPlugin({ autoHeight: true });
        return {};
      },
      template: '<div />',
    });
    mount(TestComponent);
    // autoHeight true → calls autoReportHeight(), not onHeightChange(null)
    expect(onHeightChange).not.toHaveBeenCalledWith(null);
  });

  it('should use default options (autoHeight: true) when no options passed', () => {
    const onHeightChange = vi.fn();
    (window as any).xprops = { answers: [], onHeightChange };

    const TestComponent = defineComponent({
      setup() {
        useParticipantReportPlugin(); // no options
        return {};
      },
      template: '<div />',
    });
    mount(TestComponent);
    expect(onHeightChange).not.toHaveBeenCalledWith(null);
  });
});

describe('@aha/ui - ParticipantReportPluginIframe (zoid component)', () => {
  it('should be exported and defined', () => {
    expect(ParticipantReportPluginIframe).toBeDefined();
    expect(ParticipantReportPluginIframe).not.toBeNull();
  });

  it('should be a callable zoid component (function)', () => {
    expect(typeof ParticipantReportPluginIframe).toBe('function');
  });
});
