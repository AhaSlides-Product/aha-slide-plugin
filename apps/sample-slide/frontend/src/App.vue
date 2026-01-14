<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { ahaSlidesDefaultTheme } from '@aha/ui';

const route = useRoute();
const slideId = computed(() => {
  const id = route.params.slideId;
  return Array.isArray(id) ? id[0] : id;
});
</script>

<template>
  <a-config-provider :theme="ahaSlidesDefaultTheme">
    <main>
      <router-view :key="slideId"></router-view>
    </main>
    
  </a-config-provider>
</template> 

<style scoped>
  
</style>
