import { unref, computed, type Ref } from 'vue';
import { useSync } from '@aha/ui';

export function useSlideImage(slideId: string | Ref<string | number | undefined>) {
    const channel = computed(() => {
        const id = unref(slideId);
        return id ? `slide-image-${id}` : '';
    });

    const imageUrl = useSync(channel, '');

    return { imageUrl };
}
