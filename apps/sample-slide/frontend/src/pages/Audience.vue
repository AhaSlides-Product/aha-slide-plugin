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
      <div class="teamplay-info"><b>Teamplay:</b> <pre style="display:inline">{{ JSON.stringify(presentationProps.teamplay) }}</pre></div>
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

    <div class="vote-section">
      <h3>Realtime Vote</h3>
      <div class="vote-controls">
        <a-button type="primary" size="large" @click="handleVote" :loading="voting">
          🔥 Vote Now!
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useAudiencePlugin } from '@aha/ui';

const route = useRoute();
const slideId = computed(() => route.params.slideId as string);
const { 
  presentationProps, 
  slideProps, 
  slideAttributesProps,
  audienceName,
  audienceEmoji,
  audienceId,
  audienceEmail,
  audienceTeam,
  subscribeTopic,
  unsubscribeTopic,
  audienceSendCountingAction
} = useAudiencePlugin();

const voting = ref(false);
const countTopic = computed(() => `plugin-counting/slide-${slideId}`);

const handleVote = async () => {
  if (!audienceSendCountingAction) {
    console.error('audienceSendCountingAction is not available');
    return;
  }
  
  voting.value = true;
  try {
    await audienceSendCountingAction({
      "bucket": "plugin-counting",
      "key": `slide-${slideId.value}`,
      "item": (Math.random() * 10).toString()
    });
    console.log('Vote submitted successfully');
  } catch (error) {
    console.error('Failed to submit vote:', error);
  } finally {
    voting.value = false;
  }
};

onMounted(() => {
  if (subscribeTopic) {
    watch(countTopic, (newTopic, oldTopic) => {
      if (oldTopic && unsubscribeTopic) unsubscribeTopic(oldTopic);
      if (newTopic) {
        subscribeTopic({
          type: 'counting',
          topic: newTopic,
          callback: (topic: string, message: any) => {
            console.log('Received message in Audience:', topic, message);
          }
        });
      }
    }, { immediate: true });
  }
});

onUnmounted(() => {
  if (unsubscribeTopic && countTopic.value) {
    unsubscribeTopic(countTopic.value);
  }
});

import { watch } from 'vue';
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
.vote-section {
  margin-top: 30px;
  padding: 20px;
  background: #fff0f6;
  border: 2px dashed #eb2f96;
  border-radius: 12px;
  text-align: center;
}
.vote-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}
.mqtt-display {
  width: 100%;
  text-align: left;
  background: #fff;
  padding: 10px;
  border-radius: 8px;
  font-size: 11px;
}
.mini-message-list {
  list-style: none;
  padding: 0;
  margin: 5px 0;
}
.mini-message-list li {
  padding: 4px;
  border-bottom: 1px solid #f0f0f0;
  font-family: monospace;
}
</style>
