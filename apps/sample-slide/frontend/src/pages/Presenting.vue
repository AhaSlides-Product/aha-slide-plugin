<template>
  <div class="presenting-page">
    <h1>Presenting</h1>
    <p>Currently Presenting Slide: {{ slideId }}</p>
    <router-link :to="`/canvas/${slideId}`">Back to Canvas</router-link> |
    <router-link :to="`/settings/${slideId}`">Go to Settings</router-link>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();
const slideId = computed(() => route.params.slideId);
</script>

<style scoped>
.presenting-page {
  padding: 2rem;
}
</style>
