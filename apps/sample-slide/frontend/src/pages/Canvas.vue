<template>
  <div class="canvas-page">
    <h1>Canvas View</h1>
    <p>Welcome to the Canvas for Slide: {{ slideId }}</p>
    <div class="greeting-display">
      <h2>Greeting: {{ slideGreeting }}</h2>
       <div v-if="imageUrl" style="margin-top: 10px;">
        <img :src="imageUrl" alt="Slide Image" style="max-width: 100%; max-height: 400px; border-radius: 8px;" />
      </div>
    </div>

    <div v-if="presentationProps" class="debug-section" data-testid="canvas-presentation-details-props">
      <h3>Presentation Details</h3>
      <p><b>ID:</b> {{ presentationProps.id }}</p>
      <p><b>Access:</b> {{ presentationProps.accessCode }} ({{ presentationProps.uniqueAccessCode }})</p>
      <pre class="code-block">{{ JSON.stringify(presentationProps, null, 2) }}</pre>
    </div>

    <div v-if="presentationColorPaletteProps" class="debug-section" data-testid="canvas-presentation-color-palette-props">
      <h3>Presentation Color Palette</h3>
      <pre class="code-block">{{ JSON.stringify(presentationColorPaletteProps, null, 2) }}</pre>
    </div>

    <div v-if="presentationLighterColorPaletteProps" class="debug-section" data-testid="canvas-presentation-lighter-color-palette-props">
      <h3>Presentation Lighter Color Palette</h3>
      <pre class="code-block">{{ JSON.stringify(presentationLighterColorPaletteProps, null, 2) }}</pre>
    </div>

    <div v-if="slideProps" class="debug-section" data-testid="canvas-slide-details-props">
      <h3>Slide Details</h3>
      <pre class="code-block">{{ JSON.stringify(slideProps, null, 2) }}</pre>
    </div>

    <div v-if="slideAttributes" class="debug-section" data-testid="canvas-slide-attributes">
      <h3>Slide Attributes</h3>
      <pre class="code-block">{{ JSON.stringify(slideAttributes, null, 2) }}</pre>
    </div>

    <div class="debug-section mqtt-section" data-testid="canvas-mqtt">
      <h3>Initial values of bucket ({{ bucket }})</h3>
      <pre class="code-block">{{ initialValues }}</pre>
    </div>

    <div class="debug-section mqtt-section" data-testid="canvas-mqtt">
      <h3>Realtime Messages ({{ countTopic }})</h3>
      <div v-if="mqttMessages.length === 0" class="no-messages">
        Waiting for messages...
      </div>
      <ul v-else class="message-list">
        <li v-for="(msg, index) in mqttMessages" :key="index">
          {{ msg }}
        </li>
      </ul>
    </div>
    
    <div class="debug-section submit-test-section" data-testid="canvas-submit-test">
      <h3>Submit Test Messages</h3>
      <div v-if="submitTestMessages.length === 0" class="no-messages">
        Waiting for submit test messages...
      </div>
      <ul v-else class="message-list">
        <li v-for="(msg, index) in submitTestMessages" :key="index">
          {{ msg }}
        </li>
      </ul>
    </div>


    <div class="debug-section interact-section">
      <h3>Plugin to Host Communication</h3>
      <button 
        @click="sendDemoVote" 
        class="demo-button"
        data-testid="canvas-send-vote-button"
      >
        Send Vote Count (10) to Host
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useSync, usePresenterPlugin, type PluginKeyboardEvent } from '@aha/ui';
import { useSlideImage } from '../composables/useSlideImage';
import { getBucket } from '@aha/common';
import { ApiClient } from '@aha/api';

const route = useRoute();
const slideId = route.params.slideId as string;
const { 
  presentationProps, 
  presentationColorPaletteProps,
  presentationLighterColorPaletteProps,
  slideProps, 
  getSlideAttributesAction,
  subscribeTopic,
  unsubscribeTopic,
  onKeyboard,
  emitKeyboardEvent,
  sendVoteOutcome,
  getValues,
  baseUrl,
  accessToken,
} = usePresenterPlugin();
const slideGreeting = useSync(`greeting-${slideId}`, '');
const { imageUrl } = useSlideImage(slideId);
const slideAttributes = ref<any>(null);
const lastKeyboardEvent = ref<string>('');
const mqttMessages = ref<string[]>([]);
const initialValues = ref<string>("");
const submitTestMessages = ref<string[]>([]);
const countTopic = `plugin-counting/slide-${slideId}`;
const bucket = getBucket('sample-slide', {
  presentationId: presentationProps.value?.id,
  slideId: slideProps.value?.id,
  slideVersion: slideProps.value?.version,
})
const submitTestTopic = `${bucket}/submit-test`;

onMounted(async () => {
  document.body.classList.add('enable-scroll');
  // get the initial values
  const result = await getValues?.({
    bucket 
  })
  initialValues.value = JSON.stringify(result);
  console.log('[Slide Plugin] initialValues', initialValues.value)
  
  // MQTT Integration
  if (subscribeTopic) {
    subscribeTopic({
      type: 'counting',
      topic: countTopic,
      callback: (topic: string, message: any) => {
        console.log('Received message:', topic, message);
        mqttMessages.value.unshift(`${new Date().toLocaleTimeString()}: Total Count = ${message.total} (${message.count_type})`);
        if (mqttMessages.value.length > 10) {
          mqttMessages.value.pop();
        }
      }
    });

    subscribeTopic({
      type: 'counting',
      topic: submitTestTopic,
      callback: (topic: string, message: any) => {
        console.log('Received submit test message:', topic, message);
        submitTestMessages.value.unshift(`${new Date().toLocaleTimeString()}: ${JSON.stringify(message)}`);
        if (submitTestMessages.value.length > 10) {
          submitTestMessages.value.pop();
        }
      }
    });
  }

  // Keyboard Event Integration
  // Listens for keyboard events passed down from the host application via Zoid
  if (onKeyboard) {
    onKeyboard((event: PluginKeyboardEvent) => {
      console.log('Received keyboard event:', event);
      lastKeyboardEvent.value = `${new Date().toLocaleTimeString()}: Key = ${event.key} (Code: ${event.code})`;
    });
  }

  // Guest-to-Host Communication
  // Listen for keyboard events in the iframe and emit them to the parent application
  document.onkeydown = (e: KeyboardEvent) => {
    if (emitKeyboardEvent) {
      const serializableEvent: PluginKeyboardEvent = {
        key: e.key,
        code: e.code,
        keyCode: e.keyCode,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        metaKey: e.metaKey,
        repeat: e.repeat,
        location: e.location,
      };
      console.log('[Canvas] Emitting keyboard event to Host:', serializableEvent);
      emitKeyboardEvent(serializableEvent);
    }
  };

  if (getSlideAttributesAction && slideId) {
    const attributes = await getSlideAttributesAction(slideId);
    slideAttributes.value = attributes;
    if (attributes && attributes.greeting) {
      slideGreeting.value = attributes.greeting;
    }
  }

  if (baseUrl.value) {
  const apiClient = new ApiClient(baseUrl.value, accessToken);
    const submissions = await apiClient.getSubmissions({
      slideId: slideId,
      slideVersion: slideProps.value?.version,
      type: 'sample-slide',
    });
    console.log('[Canvas] Submissions:', submissions);
  }
});

onUnmounted(() => {
  document.onkeydown = null;
  if (unsubscribeTopic) {
    unsubscribeTopic(countTopic);
    unsubscribeTopic(submitTestTopic);
  }
});

const sendDemoVote = () => {
  if (sendVoteOutcome) {
    console.log('[Canvas] Sending demo vote outcome to Host');
    sendVoteOutcome({
      voteCount: 10,
      tooltip: 'Hello from Plugin'
    });
  } else {
    console.warn('[Canvas] sendVoteOutcome action not available');
  }
};
</script>

<style scoped>
.canvas-page {
  padding: 2rem;
}
.greeting-display {
  margin: 20px 0;
  padding: 20px;
  background: #e6f7ff;
  border-radius: 8px;
  text-align: center;
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
.mqtt-section {
  border-left-color: #52c41a;
}
.keyboard-section {
  border-left-color: #eb2f96;
}
.submit-test-section {
  border-left-color: #722ed1;
}
.interact-section {
  border-left-color: #faad14;
}
.demo-button {
  background: #faad14;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: opacity 0.2s;
}
.demo-button:hover {
  opacity: 0.8;
}
.last-event {
  padding: 10px;
  background: #fff;
  font-family: monospace;
  font-weight: bold;
}
.message-list {
  list-style: none;
  padding: 0;
  margin: 10px 0;
}
.message-list li {
  padding: 8px;
  background: #fff;
  border-bottom: 1px solid #eee;
  font-family: monospace;
}
.no-messages {
  color: #999;
  font-style: italic;
}
</style>