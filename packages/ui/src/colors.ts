import { type DeepReadonly, type Ref } from 'vue';
import { useSyncReadOnly } from './sync';
import { useRoute } from 'vue-router';
/**
 * Returns a synchronized, read-only list of colors.
 */
export function useColors(): DeepReadonly<Ref<string[]>> {
  const route = useRoute();
  return useSyncReadOnly<string[]>(`color-pallete-${route.params.slideId}`, []);
}
