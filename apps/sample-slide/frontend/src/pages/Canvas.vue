<template>
  <div class="canvas-page">
    <h1>Canvas View</h1>
    <p>Welcome to the Canvas for Slide: {{ slideId }}</p>
    <div class="greeting-display">
      <h2>Greeting: {{ slideGreeting }}</h2>
    </div>

    <div v-if="presentationProps" class="debug-section">
      <h3>Presentation Details</h3>
      <p><b>ID:</b> {{ presentationProps.id }}</p>
      <p><b>Access:</b> {{ presentationProps.accessCode }} ({{ presentationProps.uniqueAccessCode }})</p>
      <pre class="code-block">{{ JSON.stringify(presentationProps, null, 2) }}</pre>
    </div>

    <div v-if="slideProps" class="debug-section">
      <h3>Slide Details</h3>
      <pre class="code-block">{{ JSON.stringify(slideProps, null, 2) }}</pre>
    </div>

    <div v-if="slideAttributes" class="debug-section">
      <h3>Slide Attributes</h3>
      <pre class="code-block">{{ JSON.stringify(slideAttributes, null, 2) }}</pre>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useSync, usePresenterPlugin } from '@aha/ui';

const route = useRoute();
const slideId = route.params.slideId as string;
const { presentationProps, slideProps, getSlideAttributesAction } = usePresenterPlugin();
const slideGreeting = useSync(`greeting-${slideId}`, '');
const slideAttributes = ref<any>(null);

onMounted(async () => {
  document.body.classList.add('enable-scroll');
  if (getSlideAttributesAction && slideId) {
    const attributes = await getSlideAttributesAction(slideId);
    slideAttributes.value = attributes;
    if (attributes && attributes.greeting) {
      slideGreeting.value = attributes.greeting;
    }
  }
});
</script>

<style scoped>
.canvas-page {
  padding: 2rem;
}
.greeting-display {
  margin: 20px 0;
  padding: 20px;
  background: #e6f7ff;
  border-radius: 8px;
  text-align: center;
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