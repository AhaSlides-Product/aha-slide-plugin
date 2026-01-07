import { type DeepReadonly, type Ref } from 'vue';
import { useSyncReadOnly } from './sync';
import { useRoute } from 'vue-router';

/**
 * Returns a synchronized, read-only list of colors for the current slide.
 * The synchronization channel is dynamically scoped to the current `slideId` from the route.
 * 
 * @returns A read-only ref containing an array of color strings.
 */
export function useColors(): DeepReadonly<Ref<string[]>> {
  const route = useRoute();
  return useSyncReadOnly<string[]>(`color-pallete-${route.params.slideId}`, []);
}
