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
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const slideId = computed(() => route.params.slideId);
const slideTitle = ref('');
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
