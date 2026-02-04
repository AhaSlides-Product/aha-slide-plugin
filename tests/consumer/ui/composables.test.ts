import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, nextTick } from 'vue';
import { useSync, useSyncReadOnly, usePresenterPlugin, useAudiencePlugin } from '@aha/ui';

/**
 * Phase 2: Vue composables consumer tests
 */
describe('@aha/ui - Composables', () => {
  describe('useSync', () => {
    it('should return a ref with initial state', () => {
      const TestComponent = defineComponent({
        setup() {
          const state = useSync('useSync-initial-state', { count: 0 });
          return { state };
        },
        template: '<div>{{ state.count }}</div>',
      });
      const wrapper = mount(TestComponent);
      expect(wrapper.vm.state).toBeDefined();
      const state = wrapper.vm.state as { count: number } | { value: { count: number } };
      const value = state && 'value' in state ? state.value : state;
      expect(value).toEqual({ count: 0 });
    });

    it('should create BroadcastChannel with the given name', () => {
      const createSpy = vi.spyOn(global, 'BroadcastChannel' as any);
      const TestComponent = defineComponent({
        setup() {
          useSync('useSync-channel-name', { foo: 1 });
          return {};
        },
        template: '<div />',
      });
      mount(TestComponent);
      expect(createSpy).toHaveBeenCalledWith('useSync-channel-name');
      createSpy.mockRestore();
    });

    it('should broadcast state changes via postMessage', async () => {
      const channelName = 'useSync-broadcast-test';
      type ChannelInstance = { name: string; postMessage: (m: unknown) => void };
      const instances: ChannelInstance[] = [];
      const OriginalBC = global.BroadcastChannel as new (name: string) => ChannelInstance;
      const ctorSpy = vi.spyOn(global, 'BroadcastChannel' as any).mockImplementation(function (this: any, name: unknown) {
        const instance = new OriginalBC(name as string);
        instances.push(instance);
        return instance;
      });
      try {
        const TestComponent = defineComponent({
          setup() {
            const state = useSync(channelName, { count: 0 });
            return { state };
          },
          template: '<div>{{ state.count }}</div>',
        });
        const wrapper = mount(TestComponent);
        const channel = instances.find((c) => c.name === channelName);
        expect(channel).toBeDefined();
        const postMessageSpy = vi.spyOn(channel!, 'postMessage');

        const stateRef = wrapper.vm.state as { value: { count: number } } | { count: number };
        if ('value' in stateRef) stateRef.value = { count: 1 };
        else (wrapper.vm as any).state = { count: 1 };
        await nextTick();

        expect(postMessageSpy).toHaveBeenCalledWith({ count: 1 });
        const value = stateRef && 'value' in stateRef ? stateRef.value : (wrapper.vm as any).state;
        expect(value).toEqual({ count: 1 });
      } finally {
        ctorSpy.mockRestore();
      }
    });

    it('should accept object and primitive initial state', () => {
      const TestComponent = defineComponent({
        setup() {
          const obj = useSync('useSync-obj-channel', { a: 1 });
          const str = useSync('useSync-str-channel', 'hello');
          return { obj, str };
        },
        template: '<div />',
      });
      const wrapper = mount(TestComponent);
      const obj = wrapper.vm.obj as { a: number } | { value: { a: number } };
      const str = wrapper.vm.str as string | { value: string };
      const objVal = obj && 'value' in obj ? obj.value : obj;
      const strVal = str && typeof str === 'object' && 'value' in str ? (str as { value: string }).value : str;
      expect(objVal).toEqual({ a: 1 });
      expect(strVal).toBe('hello');
    });
  });

  describe('useSyncReadOnly', () => {
    it('should return a readonly ref with initial state', () => {
      const TestComponent = defineComponent({
        setup() {
          const state = useSyncReadOnly('useSyncReadOnly-initial', { active: false });
          return { state };
        },
        template: '<div>{{ state.active }}</div>',
      });
      const wrapper = mount(TestComponent);
      expect(wrapper.vm.state).toBeDefined();
      const state = wrapper.vm.state as { active: boolean } | { value: { active: boolean } };
      const value = state && 'value' in state ? state.value : state;
      expect(value).toEqual({ active: false });
    });

    it('should create BroadcastChannel with the given name', () => {
      const createSpy = vi.spyOn(global, 'BroadcastChannel' as any);
      const TestComponent = defineComponent({
        setup() {
          useSyncReadOnly('useSyncReadOnly-channel-name', {});
          return {};
        },
        template: '<div />',
      });
      mount(TestComponent);
      expect(createSpy).toHaveBeenCalledWith('useSyncReadOnly-channel-name');
      createSpy.mockRestore();
    });
  });

  describe('usePresenterPlugin', () => {
    beforeEach(() => {
      (window as any).xprops = {
        presentation: { id: '1', language: 'en' },
        slide: { id: '2', version: 1 },
        baseUrl: 'https://test.ahaslide.com',
        onHeightChange: vi.fn(),
        getSlideAttributesAction: vi.fn().mockResolvedValue([]),
        upsertSlideAttributeAction: vi.fn(),
        subscribeTopic: vi.fn(),
        unsubscribeTopic: vi.fn(),
        audienceSendCountingUniqueAction: vi.fn(),
        uploadImage: vi.fn(),
        getValues: vi.fn(),
      };
    });

    it('should return reactive refs from xprops', () => {
      const TestComponent = defineComponent({
        setup() {
          const hook = usePresenterPlugin({ autoHeight: false });
          return { hook };
        },
        template: '<div />',
      });
      const wrapper = mount(TestComponent);
      expect(wrapper.vm.hook.presentationProps).toBeDefined();
      expect(wrapper.vm.hook.slideProps).toBeDefined();
      expect(wrapper.vm.hook.baseUrl).toBeDefined();
      expect(wrapper.vm.hook.presentationProps?.value).toEqual({ id: '1', language: 'en' });
      expect(wrapper.vm.hook.slideProps?.value).toEqual({ id: '2', version: 1 });
      expect(wrapper.vm.hook.baseUrl?.value).toBe('https://test.ahaslide.com');
    });

    it('should return getSlideAttributesAction and upsertSlideAttributeAction', () => {
      const TestComponent = defineComponent({
        setup() {
          const hook = usePresenterPlugin({ autoHeight: false });
          return { hook };
        },
        template: '<div />',
      });
      const wrapper = mount(TestComponent);
      expect(typeof wrapper.vm.hook.getSlideAttributesAction).toBe('function');
      expect(wrapper.vm.hook.upsertSlideAttributeAction).toBeDefined();
    });

    it('should respect autoHeight: false and not call autoReportHeight', () => {
      const onHeightChange = vi.fn();
      (window as any).xprops.onHeightChange = onHeightChange;
      const TestComponent = defineComponent({
        setup() {
          return usePresenterPlugin({ autoHeight: false });
        },
        template: '<div />',
      });
      mount(TestComponent);
      // With autoHeight false, onHeightChange(null) is called once from useBaseSlidePlugin
      expect(onHeightChange).toHaveBeenCalledWith(null);
    });
  });

  describe('useAudiencePlugin', () => {
    beforeEach(() => {
      (window as any).xprops = {
        presentation: { id: '1' },
        slide: { id: '2' },
        baseUrl: 'https://audience.ahaslide.com',
        slideAttributes: { custom: 'data' },
        audienceName: 'Alice',
        audienceEmoji: '👍',
        audienceId: 'aud-1',
        audienceEmail: 'alice@test.com',
        audienceTeam: 'Team A',
        onHeightChange: vi.fn(),
        subscribeTopic: vi.fn(),
        unsubscribeTopic: vi.fn(),
        audienceSendCountingUniqueAction: vi.fn(),
      };
    });

    it('should return base refs and audience-specific refs', () => {
      const TestComponent = defineComponent({
        setup() {
          const hook = useAudiencePlugin({ autoHeight: false });
          return { hook };
        },
        template: '<div />',
      });
      const wrapper = mount(TestComponent);
      expect(wrapper.vm.hook.presentationProps).toBeDefined();
      expect(wrapper.vm.hook.slideProps).toBeDefined();
      expect(wrapper.vm.hook.slideAttributesProps).toBeDefined();
      expect(wrapper.vm.hook.audienceName?.value).toBe('Alice');
      expect(wrapper.vm.hook.audienceEmoji?.value).toBe('👍');
      expect(wrapper.vm.hook.audienceId?.value).toBe('aud-1');
      expect(wrapper.vm.hook.audienceEmail?.value).toBe('alice@test.com');
      expect(wrapper.vm.hook.audienceTeam?.value).toBe('Team A');
    });
  });
});
