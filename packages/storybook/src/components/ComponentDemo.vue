<script setup lang="ts">
defineProps<{
  title: string;
  span?: number;
}>();
</script>

<template>
  <a-col :span="span || 12" :xs="24" :sm="24" :md="span || 12">
    <div class="component-demo">
      <div class="demo-title">
        <h3 class="text-lg font-semibold text-base-90 m-0">{{ title }}</h3>
      </div>
      <div class="demo-content">
        <slot />
      </div>
    </div>
  </a-col>
</template>

<style scoped>
.component-demo {
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.demo-title {
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.demo-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>

