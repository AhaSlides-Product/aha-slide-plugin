<template>
  <div class="settings-page">
    <p>Configure preferences for Slide: {{ slideId }}</p>
    
    <div class="settings-form">
      <h3>Slide Greeting</h3>
      <a-input v-model:value="slideGreeting" placeholder="Enter slide greeting" style="width: 300px" />
    </div>

    <div v-if="presentationProps" style="margin-top: 20px; font-size: 12px; color: #666;">
      <p>Language: {{ presentationProps.language }}</p>
      <p>Theme Font: {{ presentationProps.fontFamily }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { debounce } from 'lodash-es';
import { useSync, useSlidePlugin } from '@aha/ui';
import { useSlideUtils } from '@aha/presenter-utils';

const { getSlideData, updateSlide, slideId } = useSlideUtils();
const { presentationProps, slideActiveProps } = useSlidePlugin({ autoHeight: true });
const slideGreeting = useSync(`greeting-${slideId}`, '');

onMounted(async () => {
  const data = await getSlideData(['greeting']);
  if (data && data.greeting) {
    slideGreeting.value = data.greeting;
  }
});

const debouncedUpdate = debounce((newGreeting: string) => {
  updateSlide({ attributeKey: 'greeting', attributeValue: newGreeting });
}, 500);

watch(slideGreeting, (newGreeting) => {
  debouncedUpdate(newGreeting);
});
</script>

<style scoped>
.settings-page {
  padding: 2rem;
}
.settings-form {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
}
</style>
