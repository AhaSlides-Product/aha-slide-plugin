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

    <!-- Join Game Demo — uses the host-provided `teams` list + `joinGame` action -->
    <div class="join-section" v-if="joinGame">
      <h3>Join Game</h3>
      <div class="join-controls">
        <a-input
          v-model:value="joinName"
          placeholder="Your name"
          style="width: 240px"
          data-testid="audience-join-name-input"
        />
        <a-input
          v-model:value="joinEmoji"
          placeholder="Emoji (optional)"
          style="width: 120px"
          data-testid="audience-join-emoji-input"
        />
        <a-select
          v-if="teams && teams.length"
          v-model:value="selectedTeamId"
          placeholder="Pick your team"
          style="width: 240px"
          data-testid="audience-join-team-select"
        >
          <a-select-option v-for="team in teams" :key="team.id" :value="team.id">
            {{ team.name }}
          </a-select-option>
        </a-select>
        <a-button
          type="primary"
          :loading="joining"
          @click="handleJoinGame"
          data-testid="audience-join-game-button"
        >
          Join Game
        </a-button>
        <p v-if="audienceTeam"><b>Joined team:</b> {{ audienceTeam }}</p>
      </div>
    </div>

    <!-- Typing Demo — reports "audience is typing" to the presenter (AHA-41641) -->
    <div class="typing-section" v-if="emitTyping">
      <h3>Typing Demo</h3>
      <p>Type below — the presenter canvas shows "audience is typing…".</p>
      <a-textarea
        v-model:value="typingText"
        placeholder="Start typing your answer…"
        :rows="3"
        @input="handleTypingInput"
        @blur="handleTypingBlur"
        data-testid="audience-typing-input"
      />
    </div>

    <!-- Progress Bar Demo -->
    <div class="progress-section" v-if="timeLimit !== null">
      <h3>Slide Timer (Sync from Parent)</h3>
      <div class="timer-container">
        <div class="timer-value" :class="{ 'timer-low': (timeLimit || 0) <= 5 }">
          {{ timeLimit }}s
        </div>
        <div class="timer-bar-wrapper">
          <div class="timer-bar" :style="{ width: timerWidth + '%' }"></div>
        </div>
      </div>
    </div>
    <div class="progress-section" v-else>
      <h3>Slide Timer</h3>
      <p>No timer active (null received from parent)</p>
    </div>

    <div class="debug-section" ref="debugInfoRef">
      <h3>Audience Debug Info</h3>
      <pre class="code-block">{{ JSON.stringify({ audienceId, audienceName, audienceEmoji, audienceEmail, audienceTeam, participantInfo }, null, 2) }}</pre>
    </div>

    <div v-if="presentationProps" class="debug-section" data-testid="audience-presentation-props">
      <h3>Presentation Info</h3>
      <p><b>Access Code:</b> {{ presentationProps.accessCode }}</p>
      <div class="teamplay-info"><b>Teamplay:</b> <pre style="display:inline">{{ JSON.stringify(presentationProps.teamplay) }}</pre></div>
      <pre class="code-block">{{ JSON.stringify(presentationProps, null, 2) }}</pre>
    </div>

    <div v-if="presentationColorPaletteProps" class="debug-section" data-testid="audience-presentation-color-palette-props">
      <h3>Presentation Color Palette</h3>
      <pre class="code-block">{{ JSON.stringify(presentationColorPaletteProps, null, 2) }}</pre>
    </div>

    <div v-if="presentationLighterColorPaletteProps" class="debug-section" data-testid="audience-presentation-lighter-color-palette-props">
      <h3>Presentation Lighter Color Palette</h3>
      <pre class="code-block">{{ JSON.stringify(presentationLighterColorPaletteProps, null, 2) }}</pre>
    </div>

    <div v-if="slideProps" class="debug-section" data-testid="audience-slide-details-props">
      <h3>Slide Info</h3>
      <pre class="code-block">{{ JSON.stringify(slideProps, null, 2) }}</pre>
    </div>

    <div v-if="slideAttributesProps" class="debug-section" data-testid="audience-slide-attributes">
      <h3>Slide Attributes</h3>
      <pre class="code-block">{{ JSON.stringify(slideAttributesProps, null, 2) }}</pre>
    </div>

    <!-- Answering UI: shown at QUESTION for a full-quiz plugin, or always when
         the host isn't driving a quiz phase (quizStatus undefined). -->
    <div
      class="vote-section"
      v-if="isQuestion || quizStatus === undefined"
      data-testid="audience-quiz-question"
    >
      <h3>Realtime Vote</h3>
      <div class="vote-controls">
        <a-button ref="submitButtonRef" type="primary" size="large" @click="handleVote" :loading="voting">
          🔥 Vote Now!
        </a-button>
        <a-button type="default" size="large" @click="handleSubmitSubmission" :loading="submitting" style="margin-top: 10px;">
          📝 Submit Sample Essay
        </a-button>
        <div style="margin-top: 10px; display: flex; gap: 10px; justify-content: center;">
          <a-button @click="handleUploadImage" :loading="uploading">
            Upload Image
          </a-button>
          <a-button @click="handleShowToast">
            Show Toast
          </a-button>
        </div>
        <div style="margin-top: 10px; display: flex; gap: 10px; align-items: center; justify-content: center;">
          <a-input v-model:value="newName" placeholder="New Name" style="width: 200px" />
          <a-button @click="handleUpdateData" type="dashed">
            Update Profile
          </a-button>
        </div>
        <div style="margin-top: 10px; display: flex; gap: 10px; justify-content: center;">
          <a-button @click="handleOpenModal()" type="primary">
            Open Default Modal
          </a-button>
          <a-button @click="handleOpenModal('custom-path')" type="default">
            Open Custom Path Modal
          </a-button>
        </div>
        <div style="margin-top: 10px; display: flex; gap: 10px; justify-content: center;">
          <a-button @click="handleScrollTo(0)" type="dashed">
            📍 Scroll to Iframe Top
          </a-button>
          <a-button @click="handleScrollToDebugInfo" type="primary" ghost>
            🔍 Scroll to Debug Info
          </a-button>
        </div>
        <div style="margin-top: 10px; display: flex; gap: 10px; justify-content: center; flex-direction: column; align-items: center;">
          <a-button @click="handleGetWindowHeight" type="primary" danger ghost>
            📏 Get Window Height
          </a-button>
          <div v-if="parentWindowHeight !== null" style="font-weight: bold; color: #cf1322;">
            Parent Window Height: {{ parentWindowHeight }}px
          </div>
        </div>
        <div v-if="uploadedFile" style="margin-top: 10px;">
          <img :src="uploadedFile.url" style="max-width: 200px; border-radius: 4px;" />
        </div>
      </div>
    </div>

    <!-- Result view: shown at RESULT for a full-quiz plugin. -->
    <div
      v-else-if="isResult"
      class="quiz-result-section"
      data-testid="audience-quiz-result"
    >
      <h3>Result</h3>
      <p>The host revealed the answer — render the participant's score / correct answer here.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { useAudiencePlugin } from '@aha/ui';
import { ApiClient, type SubmissionPayload } from '@aha/api';
import { SlideType } from '@aha/api';
import { SubmissionSenderType, SubmissionType, QuizStatus } from '@aha/common';
import { getSubmissions, saveSubmission } from '@aha/db';
const route = useRoute();
const slideId = computed(() => route.params.slideId as string);
const { 
  presentationProps, 
  presentationColorPaletteProps,
  presentationLighterColorPaletteProps,
  slideProps, 
  slideAttributesProps,
  audienceName,
  audienceEmoji,
  audienceId,
  audienceEmail,
  audienceTeam,
  participantInfo,
  subscribeTopic,
  unsubscribeTopic,
  baseUrl,
  uploadImage,
  showToastSuccess,
  showToastError,
  updateAudienceData,
  openPluginModal,
  onSubmitButtonHeightChange,
  timeLimit,
  scrollTo,
  getWindowHeight,
  teams,
  joinGame,
  emitTyping,
} = useAudiencePlugin();

// Full-quiz plugin: the host owns lobby/rule/countdown and only shows this
// audience view at QUESTION/RESULT. Gate the answering UI vs the result view on
// quizStatus. Answers are still submitted through the plugin's own API — the host
// never submits on the plugin's behalf.
const quizStatus = computed(() => slideProps.value?.quizStatus);
const isQuestion = computed(() => quizStatus.value === QuizStatus.Question);
const isResult = computed(() => quizStatus.value === QuizStatus.Result);

const timerWidth = computed(() => {
  if (timeLimit.value === null || timeLimit.value === undefined) return 0;
  // Fallback to timeToAnswer from slideProps if available, otherwise assume 30s for demo bar
  const total = slideProps.value?.timeToAnswer ? parseInt(slideProps.value.timeToAnswer) : 30;
  return Math.min(100, (timeLimit.value / total) * 100);
});

const submitButtonRef = ref<any>(null);

const uploadedFile = ref<any>(null);
const uploading = ref(false);
const newName = ref('');
const parentWindowHeight = ref<number | null>(null);

/**
 * Handles requesting the parent window height.
 * This method demonstrates how to use the `getWindowHeight` bridge 
 * to get the `window.innerHeight` of the Audience App.
 */
const handleGetWindowHeight = async () => {
  if (getWindowHeight) {
    try {
      console.log('[Plugin] Requesting parent window height...');
      const height = await getWindowHeight();
      console.log('[Plugin] Received parent window height:', height);
      parentWindowHeight.value = height;
      if (showToastSuccess) {
        showToastSuccess(`Parent window height: ${height}px`);
      }
    } catch (e) {
      console.error('[Plugin] Failed to get window height:', e);
    }
  } else {
    console.warn('getWindowHeight function not available');
  }
};

const handleOpenModal = (path?: string) => {
  if (openPluginModal) {
    if (path) {
      openPluginModal(path);
    } else {
      openPluginModal();
    }
  } else {
    console.warn('openPluginModal function not available');
  }
};

const debugInfoRef = ref<HTMLElement | null>(null);

const handleScrollTo = (yOffset: number) => {
  if (scrollTo) {
    console.log('[Plugin] Requesting scroll to offset:', yOffset);
    scrollTo(yOffset);
  } else {
    console.warn('scrollTo function not available');
  }
};

const handleScrollToDebugInfo = () => {
  if (debugInfoRef.value) {
    const offsetTop = debugInfoRef.value.offsetTop;
    handleScrollTo(offsetTop);
  }
};

const handleUpdateData = () => {
  if (updateAudienceData) {
    updateAudienceData({
      audienceName: newName.value || 'New Tester',
      audienceEmoji: '🚀',
      participantInfo: [{type: 'hello', value: 'myvalue'}]
    });
    if (showToastSuccess) {
      showToastSuccess('Sent update request!');
    }
  } else {
    console.warn('updateAudienceData function not available');
  }
};

const handleUploadImage = async () => {
  if (uploadImage) {
    try {
      uploading.value = true;
      const result = await uploadImage();
      console.log('Upload result:', result);
      uploadedFile.value = result;
      if (showToastSuccess) {
        showToastSuccess('Image uploaded successfully!');
      }
    } catch (e) {
      console.error(e);
    } finally {
      uploading.value = false;
    }
  } else {
    console.warn('uploadImage function not available');
  }
};

const handleShowToast = () => {
  if (showToastSuccess) {
    showToastSuccess('This is a test toast from sample plugin!', 'test-toast');
  } else {
    console.warn('showToastSuccess function not available');
  }
};

/**
 * Typing-indicator demo (AHA-41641): report typing to the host while the
 * participant edits the field so the presenter canvas can show "audience is
 * typing…". Emit `true` on input and `false` when the field loses focus.
 * The host already throttles, so a raw per-keystroke call is fine.
 */
const typingText = ref('');
const handleTypingInput = () => {
  emitTyping?.(true);
};
const handleTypingBlur = () => {
  emitTyping?.(false);
};

const joinName = ref('');
const joinEmoji = ref('');
const selectedTeamId = ref<string | number | undefined>(undefined);
const joining = ref(false);

/**
 * Demonstrates the host-provided `joinGame` capability: collect a name/emoji
 * and (when team play is on) a team picked from the host `teams` list, then
 * join. The host validates and resolves with the outcome.
 */
const handleJoinGame = async () => {
  if (!joinGame) {
    console.warn('joinGame function not available');
    return;
  }
  joining.value = true;
  try {
    const result = await joinGame({
      audienceName: joinName.value.trim() || undefined,
      audienceEmoji: joinEmoji.value || undefined,
      teamId: selectedTeamId.value,
    });
    // `result` may be null/undefined over the Zoid bridge if the host returns
    // nothing; `result.error` is optional even on failure.
    if (result?.success) {
      showToastSuccess?.('Joined the game!');
    } else {
      showToastError?.(`Could not join: ${result?.error ?? 'please try again'}`);
    }
  } catch (e) {
    console.error('[Plugin] joinGame failed', e);
    showToastError?.('Something went wrong — please try again.');
  } finally {
    joining.value = false;
  }
};

const voting = ref(false);
const countTopic = computed(() => `plugin-counting/slide-${slideId}`);

const handleVote = async () => {
  // if (!audienceSendCountingUniqueAction) {
  //   console.error('audienceSendCountingUniqueAction is not available');
  //   return;
  // }
  
  // voting.value = true;
  // try {
  //   await audienceSendCountingUniqueAction({
  //     "bucket": "plugin-counting",
  //     "key": `slide-${slideId.value}`,
  //     "item": (Math.random() * 10).toString()
  //   });
  //   console.log('Vote submitted successfully');
  // } catch (error) {
  //   console.error('Failed to submit vote:', error);
  // } finally {
  //   voting.value = false;
  // }
  console.warn('please use sendLiveSubmission API instead')
};

const submitting = ref(false);
const handleSubmitSubmission = async () => {
  if (!baseUrl.value) {
    console.error('baseUrl is not available');
    return;
  }
  submitting.value = true;
  const payload: SubmissionPayload = {
    slideId: slideProps.value?.id || 3,
    slideVersion: slideProps.value?.version || 2,
    type: SubmissionType.Response,
    presentationId: presentationProps.value?.id || 0,
    senderId: audienceId.value?.toString() ?? "sample-audienceId",
    senderType: SubmissionSenderType.Audience,
    attributes: {
      text: "Long essay response",
      wordCount: 250,
      language: "en",
      key: "submit-test",
      increase: 10
    }
  };

  try {
    console.log('Audience: Submitting to liveproxy...', payload);
    const client = new ApiClient(baseUrl.value);
    const response = await client.sendLiveSubmission(SlideType.SampleSlide, payload);

    console.log('Audience: Liveproxy response result:', response);

    // save submission locally
    const result = await saveSubmission({...payload, slideType: SlideType.SampleSlide});
    console.log('Audience: Submission saved locally:', result);
  } catch (error) {
    console.error('Audience: Submission error:', error);
  } finally {
    submitting.value = false;
  }


};

onMounted(async () => {
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

  if (onSubmitButtonHeightChange) {
    const reportButtonHeight = () => {
      const buttonEl = submitButtonRef.value?.$el || submitButtonRef.value;
      if (buttonEl) {
        const rect = buttonEl.getBoundingClientRect();
        // Get absolute top relative to the iframe document body
        const absoluteTop = rect.top + window.scrollY;
        console.log('[Plugin] Reporting submit button height:', absoluteTop);
        onSubmitButtonHeightChange(absoluteTop);
      }
    };

    const resizeObserver = new ResizeObserver(reportButtonHeight);
    if (document.body) resizeObserver.observe(document.body);
    
    // Also report on initial mount and after some delay to ensure layout is stable
    reportButtonHeight();
    setTimeout(reportButtonHeight, 500);
    setTimeout(reportButtonHeight, 1000);
    setTimeout(reportButtonHeight, 2000);

    const pastSubmission = await getSubmissions({ 
      slideId: slideProps.value?.id ?? 0, 
      slideVersion: slideProps.value?.version ?? 0, 
      senderId: audienceId.value?.toString() ?? ""  
    });
    console.log('Audience: Past submission:', pastSubmission);

    onUnmounted(() => {
      resizeObserver.disconnect();
    });
  }
});

onUnmounted(() => {
  if (unsubscribeTopic && countTopic.value) {
    unsubscribeTopic(countTopic.value);
  }
});

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
.join-section {
  margin: 20px 0;
  padding: 20px;
  background: #f9f0ff;
  border: 1px solid #d3adf7;
  border-radius: 8px;
}
.typing-section {
  margin: 20px 0;
  padding: 20px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 8px;
}
.join-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
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

.progress-section {
  margin: 20px 0;
  padding: 20px;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 8px;
}

.timer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.timer-value {
  font-size: 32px;
  font-weight: bold;
  color: #1890ff;
}

.timer-low {
  color: #ff4d4f;
  animation: pulse 1s infinite;
}

.timer-bar-wrapper {
  width: 100%;
  height: 12px;
  background: #f5f5f5;
  border-radius: 6px;
  overflow: hidden;
}

.timer-bar {
  height: 100%;
  background: #1890ff;
  transition: width 0.3s linear;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
</style>
