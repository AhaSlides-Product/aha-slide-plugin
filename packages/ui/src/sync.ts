import { ref, watch, nextTick, readonly, type Ref, type DeepReadonly } from 'vue';
import { useBroadcastChannel, watchPausable } from '@vueuse/core';

/**
 * Synchronize a ref state across multiple browser tabs bidirectionally.
 */
export function useSync<T>(name: string, initialState: T): Ref<T> {
  const state = ref(initialState) as Ref<T>;
  const { data, post } = useBroadcastChannel<T, T>({ name });

  const { pause, resume } = watchPausable(state, (newValue) => {
    post(newValue);
  }, { deep: true });

  watch(data, async (newValue) => {
    if (newValue !== undefined && newValue !== state.value) {
      pause();
      state.value = newValue;
      await nextTick();
      resume();
    }
  });

  return state;
}

/**
 * Synchronize a state from other tabs, but do not broadcast local changes.
 * Returns a read-only ref.
 */
export function useSyncReadOnly<T>(name: string, initialState: T): DeepReadonly<Ref<T>> {
  const state = ref(initialState) as Ref<T>;
  const { data } = useBroadcastChannel<T, T>({ name });

  watch(data, (newValue) => {
    if (newValue !== undefined) {
      state.value = newValue;
    }
  });

  return readonly(state) as DeepReadonly<Ref<T>>;
}
