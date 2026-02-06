<template>
  <div class="modal-page">
    <h1>Presenter Plugin Modal</h1>
    <p>This content is loaded inside a modal triggered by the presenter plugin.</p>
    
    <div class="modal-info">
      <h3>Modal Data</h3>
      <p><b>Slide ID:</b> {{ slideId }}</p>
      <p v-if="presentationProps"><b>Presentation ID:</b> {{ presentationProps.id }}</p>
    </div>

    <div class="modal-actions">
      <a-button type="primary" danger @click="handleClose" size="large">
        Close Modal
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { usePresenterPlugin } from '@aha/ui';

const route = useRoute();
const slideId = computed(() => route.params.slideId as string);
const { 
  presentationProps,
  closePluginModal,
} = usePresenterPlugin();

const handleClose = () => {
  if (closePluginModal) {
    closePluginModal();
  } else {
    console.warn('closePluginModal function not available');
  }
};
</script>

<style scoped>
.modal-page {
  padding: 2rem;
  background: white;
  height: 100%;
  width: 100%;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.modal-info {
  margin: 20px 0;
  padding: 15px;
  background: #e6f7ff;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  border: 1px solid #91d5ff;
}
.modal-actions {
  margin-top: 30px;
}
</style>
