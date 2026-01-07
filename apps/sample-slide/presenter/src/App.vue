<script setup lang="ts">
import { theme } from '@aha/ui';
</script>

<template>
  <a-config-provider :theme="theme">
    <main>
      <router-view></router-view>
    </main>
  </a-config-provider>
</template>

<style scoped>
  
</style>
