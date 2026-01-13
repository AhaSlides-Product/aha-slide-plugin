<template>
  <div class="canvas-page">
    <p>Welcome to the Canvas for Slide: {{ slideId }}</p>
    <h1>{{ slideGreeting }}</h1>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useSyncReadOnly, usePresenterPlugin } from '@aha/ui';

const route = useRoute();
const slideId = route.params.slideId;
const { presentationProps, slideProps } = usePresenterPlugin();
presentationProps; slideProps; // Silence unused warning if needed or just remove call if not required
const slideGreeting = useSyncReadOnly(`greeting-${slideId}`, '');
</script>

<style scoped>
.canvas-page {
  padding: 2rem;
}
</style>
