<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  title: string;
  description?: string;
}>();

const id = computed(() => props.title.toLowerCase().replace(/\s+/g, '-'));
</script>

<template>
  <a-card class="component-section" :id="id">
    <template #title>
      <div class="flex items-center gap-3">
        <h2 class="text-2xl font-bold text-base-100 m-0">{{ title }}</h2>
        <a-tag color="blue">{{ description }}</a-tag>
      </div>
    </template>
    <a-row :gutter="[16, 16]">
      <slot />
    </a-row>
  </a-card>
</template>

<style scoped>
.component-section {
  border-radius: 8px;
}
</style>

