<template>
  <span 
    v-if="svgContent"
    v-html="svgContent" 
    :style="{ display: 'inline-flex', width: width || size, height: height || size }"
    :class="className"
  />
  <span v-else class="icon-placeholder" :style="{ width: width || size, height: height || size }">?</span>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';

interface Props {
  name: string;
  size?: string;
  width?: string;
  height?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: '1em',
  width: undefined,
  height: undefined,
  class: '',
});

const className = computed(() => props.class);
const svgContent = ref<string>('');

// Load SVG content
const loadIcon = async () => {
  try {
    // Import the SVG file as raw text
    const svgModule = await import(`./icons/${props.name}.svg?raw`);
    svgContent.value = svgModule.default;
  } catch (error) {
    console.warn(`Icon "${props.name}" not found`, error);
    svgContent.value = '';
  }
};

// Load icon when component mounts or name changes
onMounted(() => {
  loadIcon();
});

watch(() => props.name, () => {
  loadIcon();
});
</script>

<style scoped>
.icon-placeholder {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 4px;
  color: #999;
  font-size: 12px;
}

/* Ensure SVG inherits size and color */
:deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}
</style>

