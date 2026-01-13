<template>
  <div class="presenting-page">
    <h1>Audience View</h1>
    <p>Currently Viewing Slide: {{ slideId }}</p>

    <div class="audience-identity" v-if="audienceId">
      <h3>Audience Identity</h3>
      <div class="identity-card">
        <span class="emoji">{{ audienceEmoji || '👤' }}</span>
        <div class="details">
          <p><b>Name:</b> {{ audienceName || 'Anonymous' }}</p>
          <p><b>ID:</b> {{ audienceId }}</p>
          <p v-if="audienceEmail"><b>Email:</b> {{ audienceEmail }}</p>
          <p v-if="audienceTeam"><b>Team:</b> {{ audienceTeam }}</p>
        </div>
      </div>
    </div>

    <div v-if="presentationProps" class="debug-section">
      <h3>Presentation Info</h3>
      <p><b>Access Code:</b> {{ presentationProps.accessCode }}</p>
      <p><b>Teamplay:</b> <pre style="display:inline">{{ JSON.stringify(presentationProps.teamplay) }}</pre></p>
      <pre class="code-block">{{ JSON.stringify(presentationProps, null, 2) }}</pre>
    </div>

    <div v-if="slideProps" class="debug-section">
      <h3>Slide Info</h3>
      <pre class="code-block">{{ JSON.stringify(slideProps, null, 2) }}</pre>
    </div>

    <div v-if="slideAttributesProps" class="debug-section">
      <h3>Slide Attributes</h3>
      <pre class="code-block">{{ JSON.stringify(slideAttributesProps, null, 2) }}</pre>
    </div>

    <div style="margin-top: 20px;">
      <router-link :to="`/${route.params.type}/canvas/${slideId}`">Back to Canvas</router-link> |
      <router-link :to="`/${route.params.type}/settings/${slideId}`">Go to Settings</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { useAudiencePlugin } from '@aha/ui';

const route = useRoute();
const slideId = computed(() => route.params.slideId);
const { 
  presentationProps, 
  slideProps, 
  slideAttributesProps,
  audienceName,
  audienceEmoji,
  audienceId,
  audienceEmail,
  audienceTeam
} = useAudiencePlugin();
</script>

<style scoped>
.presenting-page {
  padding: 2rem;
}
.audience-identity {
  margin: 20px 0;
  padding: 20px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 8px;
}
.identity-card {
  display: flex;
  align-items: center;
  gap: 20px;
}
.emoji {
  font-size: 48px;
}
.details p {
  margin: 0;
}
.debug-section {
  margin-top: 20px;
  padding: 15px;
  background: #f9f9f9;
  border-left: 4px solid #1890ff;
  font-size: 13px;
}
.debug-section h3 {
  margin-bottom: 5px;
  color: #1890ff;
  font-size: 16px;
}
.code-block {
  background: #282c34;
  color: #abb2bf;
  padding: 15px;
  border-radius: 6px;
  overflow: auto;
  font-size: 12px;
}
</style>
