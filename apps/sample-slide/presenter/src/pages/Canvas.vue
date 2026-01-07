<template>
  <div class="canvas-page">
    <p>Welcome to the Canvas for Slide: {{ slideId }}</p>
    <h1>{{ slideTitle }}</h1>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useSyncReadOnly } from '@aha/ui';

const route = useRoute();
const slideId = route.params.slideId;
const slideTitle = useSyncReadOnly(`custom-title-${slideId}`, '');
</script>

<style scoped>
.canvas-page {
  padding: 2rem;
}
</style>
