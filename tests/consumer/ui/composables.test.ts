import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, nextTick } from 'vue';
import { useSync, useSyncReadOnly, usePresenterPlugin, useAudiencePlugin, useReportPlugin } from '@aha/ui';

/**
 * Vue composables consumer tests
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
        presentation: { id: '1', language: 'en', teamplay: { enabled: true } },
        slide: { id: '2', version: 1 },
        currentUser: { presenterLanguage: 'vi' },
        baseUrl: 'https://test.ahaslide.com',
        presentationColorPalette: ['#ff0000', '#00ff00'],
        presentationLighterColorPalette: ['#ffebeb', '#ebffeb'],
        onHeightChange: vi.fn(),
        getSlideAttributesAction: vi.fn().mockResolvedValue([]),
        upsertSlideAttributeAction: vi.fn(),
        subscribeTopic: vi.fn(),
        unsubscribeTopic: vi.fn(),
        uploadImage: vi.fn(),
        token: 'test-token',
        showConfirmModal: vi.fn(),
        clearSlideData: vi.fn(),
        sendVoteOutcome: vi.fn(),
        getValues: vi.fn(),
        onKeyboard: vi.fn(),
        emitKeyboardEvent: vi.fn(),
        onTyping: vi.fn(),
        openUploadImageModal: vi.fn(),
        openEditImageModal: vi.fn(),
        showToastInfo: vi.fn(),
        showToastSuccess: vi.fn(),
        showToastError: vi.fn(),
        openPluginModal: vi.fn(),
        closePluginModal: vi.fn(),
        allowPDFRender: vi.fn(),
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
      expect(wrapper.vm.hook.presentationProps?.value).toEqual({ id: '1', language: 'en', teamplay: { enabled: true } });
      expect(wrapper.vm.hook.slideProps?.value).toEqual({ id: '2', version: 1 });
      expect(wrapper.vm.hook.baseUrl?.value).toBe('https://test.ahaslide.com');
      expect(wrapper.vm.hook.presentationColorPaletteProps?.value).toEqual(['#ff0000', '#00ff00']);
      expect(wrapper.vm.hook.presentationLighterColorPaletteProps?.value).toEqual(['#ffebeb', '#ebffeb']);
      expect(wrapper.vm.hook.presentationProps?.value?.teamplay).toEqual({ enabled: true });
      expect(wrapper.vm.hook.currentUserProps?.value?.presenterLanguage).toBe('vi');
      expect(wrapper.vm.hook.accessToken).toBe('test-token');
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

    it('should return new features: accessToken, showConfirmModal, clearSlideData, setSubmissionCount', () => {
      const TestComponent = defineComponent({
        setup() {
          const hook = usePresenterPlugin({ autoHeight: false });
          return { hook };
        },
        template: '<div />',
      });
      const wrapper = mount(TestComponent);
      const hook = wrapper.vm.hook;
      expect(hook.accessToken).toBe('test-token');
      expect(typeof hook.showConfirmModal).toBe('function');
      expect(typeof hook.clearSlideData).toBe('function');
      expect(typeof hook.setSubmissionCount).toBe('function');

      // Test setSubmissionCount mapping
      hook.setSubmissionCount!({ count: 10, tooltip: 'votes' });
      expect((window as any).xprops.sendVoteOutcome).toHaveBeenCalledWith({
        voteCount: 10,
        count: 10,
        tooltip: 'votes'
      });
    });

    it('should return additional actions: getValues, uploadImage, keyboard events, image modals, toasts, plugin modals', () => {
      const TestComponent = defineComponent({
        setup() {
          const hook = usePresenterPlugin({ autoHeight: false });
          return { hook };
        },
        template: '<div />',
      });
      const wrapper = mount(TestComponent);
      const hook = wrapper.vm.hook;

      expect(hook.getValues).toBeDefined();
      expect(hook.uploadImage).toBeDefined();
      expect(hook.onKeyboard).toBeDefined();
      expect(hook.emitKeyboardEvent).toBeDefined();
      expect(hook.openUploadImageModal).toBeDefined();
      expect(hook.openEditImageModal).toBeDefined();
      expect(hook.showToastInfo).toBeDefined();
      expect(hook.showToastSuccess).toBeDefined();
      expect(hook.showToastError).toBeDefined();
      expect(hook.openPluginModal).toBeDefined();
      expect(hook.closePluginModal).toBeDefined();

      expect(typeof hook.getValues).toBe('function');
      expect(typeof hook.uploadImage).toBe('function');
      expect(typeof hook.onKeyboard).toBe('function');
      expect(typeof hook.emitKeyboardEvent).toBe('function');
      expect(typeof hook.openUploadImageModal).toBe('function');
      expect(typeof hook.openEditImageModal).toBe('function');
      expect(typeof hook.showToastInfo).toBe('function');
      expect(typeof hook.showToastSuccess).toBe('function');
      expect(typeof hook.showToastError).toBe('function');
      expect(typeof hook.openPluginModal).toBe('function');
      expect(typeof hook.closePluginModal).toBe('function');
    });

    it('should handle keyboard event registration and emission', async () => {
      const callback = vi.fn();
      const TestComponent = defineComponent({
        setup() {
          const hook = usePresenterPlugin({ autoHeight: false });
          return { hook };
        },
        template: '<div />',
      });
      const wrapper = mount(TestComponent);

      // Test registration
      wrapper.vm.hook.onKeyboard?.(callback);
      expect((window as any).xprops.onKeyboard).toHaveBeenCalledWith(callback);

      // Test emission
      const event = { key: 'Enter', code: 'Enter' } as any;
      wrapper.vm.hook.emitKeyboardEvent?.(event);
      expect((window as any).xprops.emitKeyboardEvent).toHaveBeenCalledWith(event);
    });

    it('should register an audience typing callback via onTyping', () => {
      const callback = vi.fn();
      const TestComponent = defineComponent({
        setup() {
          const hook = usePresenterPlugin({ autoHeight: false });
          return { hook };
        },
        template: '<div />',
      });
      const wrapper = mount(TestComponent);

      expect(typeof wrapper.vm.hook.onTyping).toBe('function');
      wrapper.vm.hook.onTyping?.(callback);
      expect((window as any).xprops.onTyping).toHaveBeenCalledWith(callback);
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

    /**
     * AHA-46661 — keystrokes inside the cross-origin plugin iframe never reach the
     * host document, so the SDK forwards them over the `emitKeyboardEvent` xprop.
     */
    describe('keyboard passthrough (AHA-46661)', () => {
      const mountPlugin = () => {
        const TestComponent = defineComponent({
          setup() {
            return usePresenterPlugin({ autoHeight: false });
          },
          template: '<div />',
        });
        return mount(TestComponent);
      };

      const press = (key = 'ArrowRight', target?: HTMLElement) => {
        const event = new KeyboardEvent('keydown', { key, code: key, bubbles: true });
        (target ?? document.body).dispatchEvent(event);
      };

      it('forwards a keydown to the host while presenting', () => {
        (window as any).xprops.presentation.presenting = true;
        mountPlugin();
        press('ArrowRight');
        expect((window as any).xprops.emitKeyboardEvent).toHaveBeenCalledWith(
          expect.objectContaining({ key: 'ArrowRight', code: 'ArrowRight', type: 'keydown' }),
        );
      });

      it('does not forward while in the editor (not presenting)', () => {
        (window as any).xprops.presentation.presenting = false;
        mountPlugin();
        press('ArrowRight');
        expect((window as any).xprops.emitKeyboardEvent).not.toHaveBeenCalled();
      });

      it('does not forward from an inactive (preloaded) instance', () => {
        (window as any).xprops.presentation.presenting = true;
        (window as any).xprops.active = false;
        mountPlugin();
        press('ArrowRight');
        expect((window as any).xprops.emitKeyboardEvent).not.toHaveBeenCalled();
      });

      it('does not hijack typing into a plugin input', () => {
        (window as any).xprops.presentation.presenting = true;
        mountPlugin();
        const input = document.createElement('input');
        document.body.appendChild(input);
        press('a', input);
        expect((window as any).xprops.emitKeyboardEvent).not.toHaveBeenCalled();
        input.remove();
      });

      it('is inert when the host provides no emitKeyboardEvent (settings iframe)', () => {
        (window as any).xprops.presentation.presenting = true;
        delete (window as any).xprops.emitKeyboardEvent;
        mountPlugin();
        expect(() => press('ArrowRight')).not.toThrow();
      });
    });

    it('should return allowPDFRender function (new feature by Hoang Loi)', () => {
      const TestComponent = defineComponent({
        setup() {
          const hook = usePresenterPlugin({ autoHeight: false });
          return { hook };
        },
        template: '<div />',
      });
      const wrapper = mount(TestComponent);
      const hook = wrapper.vm.hook;
      expect(typeof hook.allowPDFRender).toBe('function');

      hook.allowPDFRender!();
      expect((window as any).xprops.allowPDFRender).toHaveBeenCalled();
    });

    it('allowPDFRender should be undefined when not provided in xprops', () => {
      delete (window as any).xprops.allowPDFRender;
      const TestComponent = defineComponent({
        setup() {
          const hook = usePresenterPlugin({ autoHeight: false });
          return { hook };
        },
        template: '<div />',
      });
      const wrapper = mount(TestComponent);
      expect(wrapper.vm.hook.allowPDFRender).toBeUndefined();
    });

    it('should update currentUser when onProps is called', async () => {
      let onPropsCallback: any;
      (window as any).xprops.onProps = vi.fn((cb) => { onPropsCallback = cb; });

      const TestComponent = defineComponent({
        setup() {
          const hook = usePresenterPlugin({ autoHeight: false });
          return { hook };
        },
        template: '<div />',
      });
      const wrapper = mount(TestComponent);

      onPropsCallback({
        currentUser: { presenterLanguage: 'fr', newField: 'value' },
      });
      await nextTick();

      expect(wrapper.vm.hook.currentUserProps?.value).toEqual({ presenterLanguage: 'fr', newField: 'value' });
    });
  });

  describe('useAudiencePlugin', () => {
    beforeEach(() => {
      (window as any).xprops = {
        presentation: { id: '1', teamplay: { score: 100 } },
        slide: { id: '2' },
        baseUrl: 'https://audience.ahaslide.com',
        presentationAttributeColorPalette: { '#0000ff': '#0000ff' },
        presentationLighterColorPalette: ['#ebebff'],
        slideAttributes: { custom: 'data' },
        audience: {
          audienceName: 'Alice',
          audienceEmoji: '👍',
          audienceId: 'aud-1',
          audienceEmail: 'alice@test.com',
          audienceTeam: 'Team A',
          participantInfo: [{ type: 'custom', value: 'val' }],
        },
        onHeightChange: vi.fn(),
        subscribeTopic: vi.fn(),
        unsubscribeTopic: vi.fn(),
        updateAudienceData: vi.fn(),
        uploadImage: vi.fn(),
        emitTyping: vi.fn(),
        showToastInfo: vi.fn(),
        showToastSuccess: vi.fn(),
        showToastError: vi.fn(),
        openPluginModal: vi.fn(),
        closePluginModal: vi.fn(),
        onSubmitButtonHeightChange: vi.fn(),
        getWindowHeight: vi.fn().mockResolvedValue(800),
        getValues: vi.fn(),
      };
    });

    it('should return base refs and audience-specific refs', () => {
      (window as any).xprops = {
        presentation: { id: '1', teamPlay: { score: 100 } },
        slide: { id: '2' },
        baseUrl: 'https://audience.ahaslide.com',
        presentationColorPalette: ['#0000ff'],
        presentationLighterColorPalette: ['#ebebff'],
        slideAttributes: { custom: 'data' },
        audience: {
          audienceName: 'Alice',
          audienceEmoji: '👍',
          audienceId: 'aud-1',
          audienceEmail: 'alice@test.com',
          audienceTeam: 'Team A',
          participantInfo: [{ type: 'custom', value: 'val' }],
        },
        onHeightChange: vi.fn(),
        subscribeTopic: vi.fn(),
        unsubscribeTopic: vi.fn(),
      };
      const TestComponent = defineComponent({
        setup() {
          const hook = useAudiencePlugin({ autoHeight: false });
          return { hook };
        },
        template: '<div />',
      });
      const wrapper = mount(TestComponent);
      const hook = wrapper.vm.hook;
      expect(hook.presentationProps).toBeDefined();
      expect(hook.slideProps).toBeDefined();
      expect(hook.slideAttributesProps).toBeDefined();
      expect(hook.presentationColorPaletteProps?.value).toEqual(['#0000ff']);
      expect(hook.presentationLighterColorPaletteProps?.value).toEqual(['#ebebff']);
      expect(hook.presentationProps?.value?.teamPlay).toEqual({ score: 100 });
      expect(hook.participantInfo?.value).toEqual([{ type: 'custom', value: 'val' }]);
      const audienceName = hook.audienceName?.value ?? (hook as any).audienceName;
      const audienceEmoji = hook.audienceEmoji?.value ?? (hook as any).audienceEmoji;
      const audienceId = hook.audienceId?.value ?? (hook as any).audienceId;
      const audienceEmail = hook.audienceEmail?.value ?? (hook as any).audienceEmail;
      const audienceTeam = hook.audienceTeam?.value ?? (hook as any).audienceTeam;
      expect(audienceName).toBe('Alice');
      expect(audienceEmoji).toBe('👍');
      expect(audienceId).toBe('aud-1');
      expect(audienceEmail).toBe('alice@test.com');
      expect(audienceTeam).toBe('Team A');
    });

    it('should return new features: updateAudienceData and participantInfo', () => {
      (window as any).xprops.audience.participantInfo = [{ type: 'nickname', value: 'Ali' }];
      const TestComponent = defineComponent({
        setup() {
          const hook = useAudiencePlugin({ autoHeight: false });
          return { hook };
        },
        template: '<div />',
      });
      const wrapper = mount(TestComponent);
      const hook = wrapper.vm.hook;
      expect(typeof hook.updateAudienceData).toBe('function');
      const participantInfo = hook.participantInfo?.value ?? (hook as any).participantInfo;
      expect(participantInfo).toEqual([{ type: 'nickname', value: 'Ali' }]);

      hook.updateAudienceData!({
        audienceName: 'Bob',
        participantInfo: [{ type: 'nickname', value: 'B' }],
      });
      expect((window as any).xprops.updateAudienceData).toHaveBeenCalledWith({
        audienceName: 'Bob',
        participantInfo: [{ type: 'nickname', value: 'B' }],
      });
    });

    it('should return additional audience actions: uploadImage, toasts, plugin modals, height change', () => {
      const TestComponent = defineComponent({
        setup() {
          const hook = useAudiencePlugin({ autoHeight: false });
          return { hook };
        },
        template: '<div />',
      });
      const wrapper = mount(TestComponent);
      const hook = wrapper.vm.hook;

      expect(typeof hook.uploadImage).toBe('function');
      expect(typeof hook.showToastInfo).toBe('function');
      expect(typeof hook.showToastSuccess).toBe('function');
      expect(typeof hook.showToastError).toBe('function');
      expect(typeof hook.openPluginModal).toBe('function');
      expect(typeof hook.closePluginModal).toBe('function');
      expect(typeof hook.onSubmitButtonHeightChange).toBe('function');
    });

    it('should forward audience typing intent via emitTyping', () => {
      const TestComponent = defineComponent({
        setup() {
          const hook = useAudiencePlugin({ autoHeight: false });
          return { hook };
        },
        template: '<div />',
      });
      const wrapper = mount(TestComponent);
      const hook = wrapper.vm.hook;

      expect(typeof hook.emitTyping).toBe('function');
      hook.emitTyping!(true);
      expect((window as any).xprops.emitTyping).toHaveBeenCalledWith(true);
      hook.emitTyping!(false);
      expect((window as any).xprops.emitTyping).toHaveBeenCalledWith(false);
    });

    it('should update values when onProps is called', async () => {
      let onPropsCallback: any;
      (window as any).xprops.onProps = vi.fn((cb) => { onPropsCallback = cb; });

      const TestComponent = defineComponent({
        setup() {
          const hook = useAudiencePlugin({ autoHeight: false });
          return { hook };
        },
        template: '<div />',
      });
      const wrapper = mount(TestComponent);

      onPropsCallback({
        presentation: { id: '1', teamplay: { score: 200 } },
        slideAttributes: { custom: 'new-data' },
        audience: {
          participantInfo: [{ type: 'nickname', value: 'New' }],
        },
      });
      await nextTick();

      expect(wrapper.vm.hook.presentationProps?.value?.teamplay).toEqual({ score: 200 });
      expect(wrapper.vm.hook.slideAttributesProps?.value).toEqual({ custom: 'new-data' });
      expect(wrapper.vm.hook.participantInfo?.value).toEqual([{ type: 'nickname', value: 'New' }]);
    });

    it('should return getWindowHeight function (new feature by Tam)', async () => {
      const TestComponent = defineComponent({
        setup() {
          const hook = useAudiencePlugin({ autoHeight: false });
          return { hook };
        },
        template: '<div />',
      });
      const wrapper = mount(TestComponent);
      const hook = wrapper.vm.hook;
      expect(typeof hook.getWindowHeight).toBe('function');

      const height = await hook.getWindowHeight!();
      expect(height).toBe(800);
      expect((window as any).xprops.getWindowHeight).toHaveBeenCalled();
    });

    it('should return getValues function from base (exposed to audience)', async () => {
      const mockResult = [{ key: 'k', path: '/p', value: 'v' }];
      (window as any).xprops.getValues = vi.fn().mockResolvedValue(mockResult);
      const TestComponent = defineComponent({
        setup() {
          const hook = useAudiencePlugin({ autoHeight: false });
          return { hook };
        },
        template: '<div />',
      });
      const wrapper = mount(TestComponent);
      expect(typeof wrapper.vm.hook.getValues).toBe('function');

      const result = await wrapper.vm.hook.getValues!({ bucket: 'my-bucket', key: 'my-key' });
      expect((window as any).xprops.getValues).toHaveBeenCalledWith({ bucket: 'my-bucket', key: 'my-key' });
      expect(result).toEqual(mockResult);
    });

    it('getValues should be undefined when not provided in xprops', () => {
      delete (window as any).xprops.getValues;
      const TestComponent = defineComponent({
        setup() {
          const hook = useAudiencePlugin({ autoHeight: false });
          return { hook };
        },
        template: '<div />',
      });
      const wrapper = mount(TestComponent);
      expect(wrapper.vm.hook.getValues).toBeUndefined();
    });

    it('getWindowHeight should be undefined when not provided in xprops', () => {
      delete (window as any).xprops.getWindowHeight;
      const TestComponent = defineComponent({
        setup() {
          const hook = useAudiencePlugin({ autoHeight: false });
          return { hook };
        },
        template: '<div />',
      });
      const wrapper = mount(TestComponent);
      expect(wrapper.vm.hook.getWindowHeight).toBeUndefined();
    });

    it('should update slideAttributes reactive ref independently', async () => {
      let onPropsCallback: any;
      (window as any).xprops.onProps = vi.fn((cb) => { onPropsCallback = cb; });

      const TestComponent = defineComponent({
        setup() {
          const hook = useAudiencePlugin({ autoHeight: false });
          return { hook };
        },
        template: '<div />',
      });
      const wrapper = mount(TestComponent);

      onPropsCallback({
        slideAttributes: { updated: true },
      });
      await nextTick();

      expect(wrapper.vm.hook.slideAttributesProps?.value).toEqual({ updated: true });
    });
  });

  describe('useReportPlugin', () => {
    beforeEach(() => {
      (window as any).xprops = {
        token: 'report-token',
        currentLanguage: 'vi',
        locale: 'vi-VN',
        iframePath: '/report/1',
        onHeightChange: vi.fn(),
        trackGA4AndMixpanel: vi.fn(),
        onProps: vi.fn(),
        replaceRoute: vi.fn(),
        pushRoute: vi.fn(),
        openExportModalForPresentation: vi.fn(),
        featureFlags: { flag1: true },
        translationMap: { key1: 'value1' },
      };
    });

    it('should return initial values from xprops', () => {
      const TestComponent = defineComponent({
        setup() {
          const hook = useReportPlugin({ autoHeight: false });
          return { hook };
        },
        template: '<div />',
      });
      const wrapper = mount(TestComponent);
      const hook = wrapper.vm.hook;
      expect(hook.token.value).toBe('report-token');
      expect(hook.currentLanguage.value).toBe('vi');
      expect(hook.locale.value).toBe('vi-VN');
      expect(hook.iframePath.value).toBe('/report/1');
    });

    it('should update values when onProps is called', async () => {
      let onPropsCallback: any;
      (window as any).xprops.onProps = vi.fn((cb) => { onPropsCallback = cb; });

      const TestComponent = defineComponent({
        setup() {
          const hook = useReportPlugin({ autoHeight: false });
          return { hook };
        },
        template: '<div />',
      });
      const wrapper = mount(TestComponent);

      onPropsCallback({
        token: 'new-token',
        currentLanguage: 'en',
        locale: 'en-US',
        iframePath: '/new/path',
        featureFlags: { updated: true },
        translationMap: { key: 'new' },
      });
      await nextTick();

      expect(wrapper.vm.hook.token.value).toBe('new-token');
      expect(wrapper.vm.hook.currentLanguage.value).toBe('en');
      expect(wrapper.vm.hook.locale.value).toBe('en-US');
      expect(wrapper.vm.hook.iframePath.value).toBe('/new/path');
      expect(wrapper.vm.hook.featureFlags.value).toEqual({ updated: true });
      expect(wrapper.vm.hook.translationMap.value).toEqual({ key: 'new' });
    });

    it('should update translationMap and featureFlags reactive refs independently', async () => {
      let onPropsCallback: any;
      (window as any).xprops.onProps = vi.fn((cb) => { onPropsCallback = cb; });

      const TestComponent = defineComponent({
        setup() {
          const hook = useReportPlugin({ autoHeight: false });
          return { hook };
        },
        template: '<div />',
      });
      const wrapper = mount(TestComponent);

      onPropsCallback({
        featureFlags: { flag2: false },
        translationMap: { key2: 'value2' },
      });
      await nextTick();

      expect(wrapper.vm.hook.featureFlags.value).toEqual({ flag2: false });
      expect(wrapper.vm.hook.translationMap.value).toEqual({ key2: 'value2' });
    });
  });
});
