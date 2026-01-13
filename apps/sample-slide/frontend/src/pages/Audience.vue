<template>
  <div class="presenting-page">
    <h1>Audience View</h1>
    <p>Currently Viewing Slide: {{ slideId }}</p>
    <div v-if="presentationProps" class="debug-info">
      <h3>Presentation Info:</h3>
      <pre>{{ JSON.stringify(presentationProps, null, 2) }}</pre>
    </div>
    <div v-if="slideProps" class="debug-info">
      <h3>Slide Info:</h3>
      <pre>{{ JSON.stringify(slideProps, null, 2) }}</pre>
    </div>
    <router-link :to="`/${route.params.type}/canvas/${slideId}`">Back to Canvas</router-link> |
    <router-link :to="`/${route.params.type}/settings/${slideId}`">Go to Settings</router-link>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { useAudiencePlugin } from '@aha/ui';

const route = useRoute();
const slideId = computed(() => route.params.slideId);
const { presentationProps, slideProps } = useAudiencePlugin();
</script>

<style scoped>
.presenting-page {
  padding: 2rem;
}
</style>
