<template>
  <div class="settings-page">
    <p>Configure preferences for Slide: {{ slideId }}</p>
    
    <div class="settings-form">
      <h3>Slide Title</h3>
      <a-input v-model:value="slideTitle" placeholder="Enter slide title" style="width: 300px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useSync } from '@aha/ui';

const route = useRoute();
const slideId = route.params.slideId;
const slideTitle = useSync(`custom-title-${slideId}`, '');
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
