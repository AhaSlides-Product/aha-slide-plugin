<template>
  <div class="canvas-page">
    <p>Welcome to the Canvas for Slide: {{ slideId }}</p>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();
const slideId = computed(() => route.params.slideId);
</script>

<style scoped>
.canvas-page {
  padding: 2rem;
}
</style>
