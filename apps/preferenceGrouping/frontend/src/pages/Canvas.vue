<template>
  <div class="pg-canvas" :style="rootStyle">
    <!-- Reveal: the formed groups -->
    <section v-if="revealed && groups.length" class="pg-reveal" data-testid="canvas-preference-grouping-reveal">
      <h2 class="pg-heading">{{ t('Groups are ready') }}</h2>
      <div class="pg-grid">
        <article
          v-for="(group, index) in groups"
          :key="group.id"
          class="pg-card"
          :style="cardStyle"
        >
          <header class="pg-card__head">
            <span class="pg-card__badge" :style="badgeStyle(index)">{{ index + 1 }}</span>
            <span class="pg-card__title">{{ t('Group {number}', { number: index + 1 }) }}</span>
            <span class="pg-card__count">{{ memberCountLabel(group.memberIds.length) }}</span>
          </header>
          <ul class="pg-card__members">
            <li v-for="id in group.memberIds" :key="id" class="pg-member">
              <span class="pg-member__emoji">{{ participantEmoji(id) }}</span>
              <span class="pg-member__name">{{ participantName(id) }}</span>
            </li>
          </ul>
        </article>
      </div>
    </section>

    <!-- Collecting picks: the live tally -->
    <section v-else class="pg-tally" data-testid="canvas-preference-grouping-tally">
      <p class="pg-prompt">{{ t('Choose up to {limit} people you\'d like to team up with', { limit: pickLimit }) }}</p>
      <p class="pg-tagline">{{ t('Everyone chooses. AhaSlides does the grouping.') }}</p>

      <div v-if="totalCount > 0" class="pg-counter">
        <span class="pg-counter__value">{{ submittedCount }}<span class="pg-counter__of"> / {{ totalCount }}</span></span>
        <span class="pg-counter__label">{{ t('{submitted} of {total} submitted', { submitted: submittedCount, total: totalCount }) }}</span>
      </div>
      <p v-else class="pg-waiting">{{ t('Waiting for people to join…') }}</p>
    </section>

    <!-- In-canvas action fallback (only when the host control bar is unavailable) -->
    <div v-if="!hostHandlesActions" class="pg-actionbar">
      <a-config-provider :theme="theme">
        <a-button
          type="primary"
          size="large"
          :loading="forming"
          :disabled="totalCount === 0"
          data-testid="canvas-preference-grouping-form-groups"
          @click="onFormGroups"
        >
          {{ actionLabel }}
        </a-button>
      </a-config-provider>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue';
import { useI18n } from '../i18n';
import { usePresenterPlugin, type PluginAction } from '@aha/ui';
import { useTheme, readableInk } from '../composables/useTheme';
import { usePresenterGrouping } from '../composables/usePresenterGrouping';
import { syncLocale } from '../i18n';
import { DEFAULT_TARGET_SIZE, pickLimitForTargetSize, readStoredTargetSize, syncKey } from '../constants';
import { useSync } from '@aha/ui';

const { t } = useI18n();

const {
  presentationProps,
  presentationColorPaletteProps,
  presentationLighterColorPaletteProps,
  slideProps,
  audiences,
  baseUrl,
  getSlideAttributesAction,
  upsertSlideAttributeAction,
  subscribeTopic,
  unsubscribeTopic,
  setActionButtons,
  onActionInvoke,
  showToastError,
} = usePresenterPlugin({ autoHeight: false });

const { themeReady, accent, theme } = useTheme({
  fontFamily: computed(() => presentationProps.value?.fontFamily),
  textColour: computed(() => slideProps.value?.textColour),
  palette: presentationColorPaletteProps,
  lighterPalette: presentationLighterColorPaletteProps,
});

watch(
  () => presentationProps.value?.language,
  (language) => syncLocale(language),
  { immediate: true },
);

const slideId = computed(() => slideProps.value?.id);
const targetSize = useSync<number>(
  computed(() => (slideId.value ? syncKey.targetSize(slideId.value) : undefined)),
  DEFAULT_TARGET_SIZE,
);
const pickLimit = computed(() => pickLimitForTargetSize(targetSize.value ?? DEFAULT_TARGET_SIZE));

const grouping = usePresenterGrouping({
  baseUrl,
  slideProps,
  presentationProps,
  audiences,
  targetSize: computed(() => targetSize.value ?? DEFAULT_TARGET_SIZE),
  upsertSlideAttribute: upsertSlideAttributeAction,
  subscribeTopic,
  unsubscribeTopic,
});
const { roster, totalCount, submittedCount, groups, revealed, forming } = grouping;

const palette = computed(() => presentationColorPaletteProps.value ?? []);

const rootStyle = computed(() => ({
  color: 'var(--pg-text)',
  fontFamily: 'var(--pg-font)',
  visibility: themeReady.value ? 'visible' : 'hidden',
} as Record<string, string>));

const cardStyle = computed(() => ({
  background: 'color-mix(in srgb, currentColor 5%, transparent)',
  border: '1px solid var(--pg-border)',
}));

function accentFor(index: number): string {
  return palette.value[index % palette.value.length] ?? accent.value;
}
function badgeStyle(index: number): Record<string, string> {
  const fill = accentFor(index);
  return { background: fill, color: readableInk(fill) };
}

function participant(id: string) {
  return roster.value.find((p) => p.id === id);
}
function participantName(id: string): string {
  return participant(id)?.name || id;
}
function participantEmoji(id: string): string {
  return participant(id)?.emoji || '🙂';
}
function memberCountLabel(count: number): string {
  return count === 1 ? t('1 person') : t('{count} people', { count });
}

const actionLabel = computed(() =>
  forming.value ? t('Forming groups…') : revealed.value ? t('Re-form groups') : t('Form groups'),
);

const hostHandlesActions = computed(() => !!setActionButtons);

async function onFormGroups(): Promise<void> {
  try {
    await grouping.formGroups();
  } catch {
    showToastError?.(t('Could not form groups. Please try again.'));
  }
}

// Declare the "Form groups" action to the host control bar (when supported).
const actionButtons = computed<PluginAction[]>(() => [
  {
    id: 'form-groups',
    label: actionLabel.value,
    variant: 'primary',
    loading: forming.value,
    disabled: totalCount.value === 0,
  },
]);
watch(actionButtons, (actions) => setActionButtons?.(actions), { immediate: true });
onActionInvoke?.((id) => {
  if (id === 'form-groups') onFormGroups();
});

let submittedTopic: string | undefined;

onMounted(async () => {
  if (slideId.value && getSlideAttributesAction) {
    try {
      const attributes = await getSlideAttributesAction(slideId.value);
      const storedTargetSize = readStoredTargetSize(attributes);
      if (storedTargetSize != null) targetSize.value = storedTargetSize;
      grouping.restoreState(attributes);
    } catch (error) {
      console.warn('[preferenceGrouping] could not restore grouping state', error);
    }
  }
  grouping.loadSubmittedCount();
  submittedTopic = grouping.watchSubmissions();
  grouping.publishRoster();
  grouping.publishTargetSize();
});

onUnmounted(() => {
  if (submittedTopic) unsubscribeTopic?.(submittedTopic);
  setActionButtons?.([]);
  onActionInvoke?.(() => {});
});
</script>

<style scoped>
.pg-canvas {
  box-sizing: border-box;
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 48px 56px 96px;
  background: transparent;
}
.pg-tally {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
}
.pg-prompt {
  margin: 0;
  font-size: 40px;
  font-weight: 600;
  max-width: 22ch;
}
.pg-tagline {
  margin: 0;
  font-size: 22px;
  opacity: 0.75;
}
.pg-counter {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.pg-counter__value {
  font-size: 96px;
  font-weight: 600;
  line-height: 1;
}
.pg-counter__of {
  opacity: 0.5;
}
.pg-counter__label {
  font-size: 20px;
  opacity: 0.75;
}
.pg-waiting {
  margin-top: 24px;
  font-size: 24px;
  opacity: 0.7;
}
.pg-reveal {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.pg-heading {
  margin: 0;
  font-size: 32px;
  font-weight: 600;
  text-align: center;
}
.pg-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}
.pg-card {
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.pg-card__head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.pg-card__badge {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
}
.pg-card__title {
  font-size: 20px;
  font-weight: 600;
}
.pg-card__count {
  margin-left: auto;
  font-size: 16px;
  opacity: 0.6;
}
.pg-card__members {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.pg-member {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
}
.pg-member__emoji {
  font-size: 20px;
  line-height: 1;
}
.pg-member__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pg-actionbar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 24px;
  display: flex;
  justify-content: center;
  pointer-events: none;
}
.pg-actionbar :deep(.ant-btn) {
  pointer-events: auto;
}
</style>
