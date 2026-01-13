import { ref, watch, nextTick, readonly, unref, type Ref, type DeepReadonly } from 'vue';

/**
 * Synchronize a reactive state ref across multiple browser tabs bidirectionally.
 * 
 * @template T - The type of the state being synchronized.
 * @param name - The unique name of the synchronization channel (can be a Ref or string).
 * @param initialState - The initial value of the state.
 * @returns A reactive ref that stays in sync across tabs.
 */
export function useSync<T>(name: string | Ref<any>, initialState: T): Ref<T> {
  const state = ref(initialState) as Ref<T>;
  let bc: BroadcastChannel | null = null;
  let isInternalUpdate = false;

  const closeChannel = () => {
    if (bc) {
      bc.close();
      bc = null;
    }
  };

  const openChannel = (channelName: string) => {
    closeChannel();
    if (!channelName) return;

    bc = new BroadcastChannel(channelName);
    bc.onmessage = (event) => {
      console.log(`[useSync:${channelName}] received:`, event.data);
      if (event.data !== undefined && JSON.stringify(event.data) !== JSON.stringify(state.value)) {
        isInternalUpdate = true;
        state.value = event.data;
        nextTick(() => {
          isInternalUpdate = false;
        });
      }
    };
  };

  // Sync state changes to other tabs
  watch(state, (newValue) => {
    if (isInternalUpdate) return;
    if (bc) {
      console.log(`[useSync:${unref(name)}] broadcasting:`, newValue);
      bc.postMessage(JSON.parse(JSON.stringify(newValue)));
    }
  }, { deep: true });

  // Handle name changes reactively
  watch(() => unref(name), (newName) => {
    if (newName) {
      openChannel(newName);
    } else {
      closeChannel();
    }
  }, { immediate: true });

  return state;
}

/**
 * Synchronize a state from other tabs, but do not broadcast local changes.
 * 
 * @template T - The type of the state being synchronized.
 * @param name - The unique name of the synchronization channel.
 * @param initialState - The initial value of the state.
 * @returns A read-only reactive ref.
 */
export function useSyncReadOnly<T>(name: string | Ref<any>, initialState: T): DeepReadonly<Ref<T>> {
  const state = ref(initialState) as Ref<T>;
  let bc: BroadcastChannel | null = null;

  const closeChannel = () => {
    if (bc) {
      bc.close();
      bc = null;
    }
  };

  const openChannel = (channelName: string) => {
    closeChannel();
    if (!channelName) return;

    bc = new BroadcastChannel(channelName);
    bc.onmessage = (event) => {
      if (event.data !== undefined) {
        state.value = event.data;
      }
    };
  };

  watch(() => unref(name), (newName) => {
    if (newName) {
      openChannel(newName);
    } else {
      closeChannel();
    }
  }, { immediate: true });

  return readonly(state) as DeepReadonly<Ref<T>>;
}
