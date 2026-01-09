<template>
  <div class="canvas-page">
    <p>Welcome to the Canvas for Slide: {{ slideId }}</p>
    <h1>{{ slideGreeting }}</h1>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useSyncReadOnly } from '@aha/ui';

const route = useRoute();
const slideId = route.params.slideId;
const slideGreeting = useSyncReadOnly(`greeting-${slideId}`, '');
</script>

<style scoped>
.canvas-page {
  padding: 2rem;
}
</style>
