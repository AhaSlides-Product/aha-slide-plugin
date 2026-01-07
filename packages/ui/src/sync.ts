import { ref, watch, nextTick, readonly, type Ref, type DeepReadonly } from 'vue';
import { useBroadcastChannel, watchPausable } from '@vueuse/core';

/**
 * Synchronize a reactive state ref across multiple browser tabs bidirectionally.
 * Uses the BroadcastChannel API under the hood via VueUse.
 * 
 * @template T - The type of the state being synchronized.
 * @param name - The unique name of the synchronization channel.
 * @param initialState - The initial value of the state.
 * @returns A reactive ref that stays in sync across tabs.
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
 * This is useful for listeners that should only react to remote updates.
 * 
 * @template T - The type of the state being synchronized.
 * @param name - The unique name of the synchronization channel.
 * @param initialState - The initial value of the state.
 * @returns A read-only reactive ref.
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
