<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { ahaSlidesDefaultTheme } from '@aha/ui';
import { usePreloadActive } from './composables/usePreload';

const route = useRoute();
const slideId = computed(() => {
  const id = route.params.slideId;
  return Array.isArray(id) ? id[0] : id;
});

// Keep-alive preload gate: while the host preloads this iframe (xprops.active
// === false) the bundles boot but the slide component is NOT rendered and no
// slide data is consumed. When the host flips active to true the router-view
// mounts and the real slide renders with data — no bundle reload.
const { isActive } = usePreloadActive();
</script>

<template>
  <a-config-provider :theme="ahaSlidesDefaultTheme">
    <main>
      <router-view v-if="isActive" :key="slideId"></router-view>
    </main>

  </a-config-provider>
</template>

<style scoped>
  
</style>
