<template>
  <div class="settings-page">
    <p>Configure preferences for Slide: {{ slideId }}</p>
    
    <div class="settings-form">
      <h3>Slide Greeting</h3>
      <a-input v-model:value="slideGreeting" placeholder="Enter slide greeting" style="width: 300px" />
    </div>
    <div>
      <a-typography-title>Heading 1</a-typography-title>
      <a-typography-title :level="2">Heading 2</a-typography-title>
    </div>
    <a-button type="primary" size="small">Sample button</a-button>

    <div v-if="presentationProps" class="debug-section">
      <h3>Presentation Details</h3>
      <p><b>ID:</b> {{ presentationProps.id }}</p>
      <p><b>Language:</b> {{ presentationProps.language }}</p>
      <p><b>Font Family:</b> {{ presentationProps.fontFamily }}</p>
      <p><b>Access Codes:</b> 
        Unique: {{ presentationProps.uniqueAccessCode }}, 
        Share: {{ presentationProps.shareCode }}, 
        Access: {{ presentationProps.accessCode }}
      </p>
      <div class="teamplay-info"><b>Teamplay:</b> <pre style="display:inline">{{ JSON.stringify(presentationProps.teamplay) }}</pre></div>
    </div>

    <div v-if="slideProps" class="debug-section">
      <h3>Slide Details</h3>
      <p><b>Slide ID:</b> {{ slideProps.id }}</p>
      <p v-if="slideProps.textColour"><b>Text Colour:</b> <span :style="{ color: slideProps.textColour }">{{ slideProps.textColour }}</span></p>
      <pre>{{ JSON.stringify(slideProps, null, 2) }}</pre>
    </div>

    <div v-if="attributeResponse" class="debug-section">
      <h3>Slide Attributes</h3>
      <pre class="code-block">{{ JSON.stringify(attributeResponse, null, 2) }}</pre>
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
 * @param {string | number} [id] - The ID of the slide to fetch attributes for.
 * @returns {Promise<void>}
 */
const handleGetAttributes = async (id?: string | number) => {
  if (getSlideAttributesAction) {
    try {
      attributeResponse.value = await getSlideAttributesAction(id);
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
  if (slideId.value) {
    const attributes = await handleGetAttributes(slideId.value);
    if (attributes && attributes.greeting) {
      slideGreeting.value = attributes.greeting;
    }
  }
});

const debouncedUpdate = debounce((newGreeting: string) => {
  if (upsertSlideAttributeAction) {
    upsertSlideAttributeAction({ attributeKey: 'greeting', attributeValue: newGreeting })
  }
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
.debug-section {
  margin-top: 20px;
  padding: 15px;
  background: #f9f9f9;
  border-left: 4px solid #1890ff;
  font-size: 13px;
}
.debug-section h3 {
  margin-bottom: 5px;
  color: #1890ff;
  font-size: 16px;
}
.code-block {
  background: #282c34;
  color: #abb2bf;
  padding: 15px;
  border-radius: 6px;
  overflow: auto;
  font-size: 12px;
}
</style>
