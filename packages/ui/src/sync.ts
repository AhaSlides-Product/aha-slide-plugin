import { ref, watch, unref, readonly, onUnmounted, type Ref, type DeepReadonly } from 'vue';
import { createSync as coreCreateSync, createSyncReadOnly as coreCreateSyncReadOnly } from '@aha/core';

/**
 * Synchronize a reactive state ref across multiple browser tabs bidirectionally.
 *
 * @deprecated Use `createSync` from `@aha/core` instead.
 * @template T - The type of the state being synchronized.
 * @param name - The unique name of the synchronization channel (can be a Ref or string).
 * @param initialState - The initial value of the state.
 * @returns A reactive ref that stays in sync across tabs.
 */
export function useSync<T>(name: string | Ref<any>, initialState: T): Ref<T> {
  const state = ref(initialState) as Ref<T>;
  let sync = coreCreateSync<T>(unref(name) || '', initialState);
  let unsub: (() => void) | null = null;
  let isExternalUpdate = false;

  const setup = (channelName: string) => {
    unsub?.();
    sync.destroy();
    if (!channelName) return;
    sync = coreCreateSync<T>(channelName, state.value as T);
    unsub = sync.onStateChange((val) => {
      isExternalUpdate = true;
      state.value = val as any;
      isExternalUpdate = false;
    });
  };

  watch(state, (newValue) => {
    if (isExternalUpdate) return;
    sync.setState(newValue as T);
  }, { deep: true });

  watch(() => unref(name), (newName) => setup(newName), { immediate: true });

  onUnmounted(() => {
    unsub?.();
    sync.destroy();
  });

  return state;
}

/**
 * Synchronize a state from other tabs, but do not broadcast local changes.
 *
 * @deprecated Use `createSyncReadOnly` from `@aha/core` instead.
 * @template T - The type of the state being synchronized.
 * @param name - The unique name of the synchronization channel.
 * @param initialState - The initial value of the state.
 * @returns A read-only reactive ref.
 */
export function useSyncReadOnly<T>(name: string | Ref<any>, initialState: T): DeepReadonly<Ref<T>> {
  const state = ref(initialState) as Ref<T>;
  let sync = coreCreateSyncReadOnly<T>(unref(name) || '', initialState);
  let unsub: (() => void) | null = null;

  const setup = (channelName: string) => {
    unsub?.();
    sync.destroy();
    if (!channelName) return;
    sync = coreCreateSyncReadOnly<T>(channelName, state.value as T);
    unsub = sync.onStateChange((val) => {
      state.value = val as any;
    });
  };

  watch(() => unref(name), (newName) => setup(newName), { immediate: true });

  onUnmounted(() => {
    unsub?.();
    sync.destroy();
  });

  return readonly(state) as DeepReadonly<Ref<T>>;
}
