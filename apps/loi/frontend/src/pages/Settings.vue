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

    <div style="margin-top: 20px;">
      <a-button type="primary" @click="handleGetAttributes">Get Slide Attributes</a-button>
      <div v-if="attributeResponse" style="margin-top: 10px;">
        <h4>Response:</h4>
        <pre style="background: #f4f4f4; padding: 10px; border-radius: 4px; font-size: 12px;">{{ attributeResponse }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref, computed } from 'vue';
import { debounce } from 'lodash-es';
import { useSync, usePresenterPlugin } from '@aha/ui';

const { presentationProps, slideProps, upsertSlideAttributeAction, getSlideAttributesAction } = usePresenterPlugin({ autoHeight: true });
const slideId = computed(() => slideProps.value?.id);
const slideGreeting = useSync(computed(() => `greeting-${slideId.value}`), '');
// xprops removed as it is now handled by usePresenterPlugin

/**
 * Stores the response from the getSlideAttributesAction call.
 */
const attributeResponse = ref<any>(null);

/**
 * Handles the click event to fetch slide attributes from the parent application.
 * Calls the `getSlideAttributesAction` provided by the parent via xprops.
 * 
 * @returns {Promise<void>}
 */
const handleGetAttributes = async () => {
  if (getSlideAttributesAction) {
    try {
      attributeResponse.value = await getSlideAttributesAction();
      console.log('Attributes response:', attributeResponse.value);
      return attributeResponse.value;
    } catch (error) {
      console.error('Error calling getSlideAttributesAction:', error);
    }
  } else {
    console.warn('getSlideAttributesAction is not available');
  }
};

onMounted(async () => {
  const attributes = await handleGetAttributes();
  if (attributes && attributes.greeting) {
    slideGreeting.value = attributes.greeting;
  }
});

const debouncedUpdate = debounce((newGreeting: string) => {
  upsertSlideAttributeAction({ attributeKey: 'greeting', attributeValue: newGreeting })
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
