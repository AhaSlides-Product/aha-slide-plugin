<template>
  <div class="pg-audience" :style="rootStyle">
    <template v-if="themeReady">
      <!-- Reveal: this participant's own group -->
      <section v-if="revealed" class="pg-stack" data-testid="audience-preference-grouping-reveal">
        <p class="pg-tagline">{{ t('Everyone chooses. AhaSlides does the grouping.') }}</p>
        <div v-if="myGroup" class="pg-your-group">
          <div class="pg-your-group__badge" :style="{ background: 'var(--pg-accent)', color: 'var(--pg-accent-ink)' }">
            {{ t('You\'re in {group}', { group: groupLabel(myGroup) }) }}
          </div>
          <p v-if="myGroupMates.length" class="pg-with">
            {{ t('with {names}', { names: mateNames }) }}
          </p>
          <ul class="pg-mates">
            <li v-for="mate in myGroupMates" :key="mate.id" class="pg-mate">
              <span class="pg-mate__emoji">{{ mate.emoji || '🙂' }}</span>
              <span class="pg-mate__name">{{ mate.name || mate.id }}</span>
            </li>
          </ul>
        </div>
        <p v-else class="pg-solo">{{ t('You\'re flying solo for this round.') }}</p>
      </section>

      <!-- Submitted, waiting for the reveal -->
      <section v-else-if="submitted" class="pg-stack pg-centered" data-testid="audience-preference-grouping-submitted">
        <div class="pg-check" :style="{ background: 'var(--pg-accent)', color: 'var(--pg-accent-ink)' }" aria-hidden="true">✓</div>
        <h2 class="pg-title">{{ t('You\'re all set') }}</h2>
        <p class="pg-help">{{ t('Your picks are in — sit tight while the groups are formed.') }}</p>
        <button type="button" class="pg-link" data-testid="audience-preference-grouping-edit" @click="onEdit">
          {{ t('Edit picks') }}
        </button>
      </section>

      <!-- Picker -->
      <section v-else class="pg-stack" data-testid="audience-preference-grouping-picker">
        <header class="pg-header">
          <h2 class="pg-title">{{ t('Choose up to {limit} people you\'d like to team up with', { limit: PICK_LIMIT }) }}</h2>
          <p class="pg-tagline">{{ t('Everyone chooses. AhaSlides does the grouping.') }}</p>
        </header>

        <div v-if="pickablePeers.length === 0" class="pg-empty">
          <p class="pg-empty__title">{{ t('No one else has joined yet') }}</p>
          <p class="pg-help">{{ t('People will appear here as they join.') }}</p>
        </div>

        <template v-else>
          <input
            v-if="pickablePeers.length > 8"
            v-model="search"
            class="pg-search"
            type="text"
            :placeholder="t('Search people')"
            data-testid="audience-preference-grouping-search"
          />
          <p class="pg-count" aria-live="polite">
            {{ t('{selected} of {limit} selected', { selected: selected.length, limit: PICK_LIMIT }) }}
          </p>
          <ul class="pg-peers">
            <li v-for="peer in visiblePeers" :key="peer.id">
              <button
                type="button"
                class="pg-peer"
                :class="{ 'pg-peer--on': isSelected(peer.id), 'pg-peer--off': isDisabled(peer.id) }"
                :style="peerStyle(peer.id)"
                :aria-pressed="isSelected(peer.id)"
                :disabled="isDisabled(peer.id)"
                :data-testid="`audience-preference-grouping-peer-${peer.id}`"
                @click="toggle(peer.id)"
              >
                <span class="pg-peer__emoji">{{ peer.emoji || '🙂' }}</span>
                <span class="pg-peer__name">{{ peer.name || peer.id }}</span>
                <span class="pg-peer__mark" aria-hidden="true">{{ isSelected(peer.id) ? '✓' : '' }}</span>
              </button>
            </li>
          </ul>
        </template>

        <button
          ref="submitRef"
          type="button"
          class="pg-submit"
          :style="submitStyle"
          :disabled="submitting"
          data-testid="audience-preference-grouping-submit-button"
          @click="onSubmit"
        >
          <span v-if="submitting" class="pg-spinner" aria-hidden="true"></span>
          {{ submitting ? t('Submitting…') : t('Submit') }}
        </button>
      </section>
    </template>

    <!-- Cold-start skeleton while the zoid handshake populates xprops -->
    <div v-else class="pg-skeleton" aria-hidden="true">
      <div class="pg-skeleton__line"></div>
      <div class="pg-skeleton__row"></div>
      <div class="pg-skeleton__row"></div>
      <div class="pg-skeleton__button"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from '../i18n';
import { useAudiencePlugin } from '@aha/ui';
import { useTheme, readableInk } from '../composables/useTheme';
import { useAudienceGrouping } from '../composables/useAudienceGrouping';
import { syncLocale } from '../i18n';
import { PICK_LIMIT } from '../constants';
import type { Group } from '../types';

const { t } = useI18n();
useRoute();

const {
  presentationProps,
  presentationColorPaletteProps,
  presentationLighterColorPaletteProps,
  slideProps,
  slideAttributesProps,
  audienceId,
  showToastSuccess,
  showToastError,
  onSubmitButtonHeightChange,
} = useAudiencePlugin({ autoHeight: true });

const { themeReady, accent } = useTheme({
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

const grouping = useAudienceGrouping({
  baseUrl: computed(() => (window as any).xprops?.baseUrl),
  slideProps,
  presentationProps,
  slideAttributes: slideAttributesProps,
  audienceId,
});
const { pickablePeers, revealed, myGroup, myGroupMates, submitted, submitting } = grouping;

const selected = ref<string[]>([]);
const search = ref('');
const submitRef = ref<HTMLButtonElement | null>(null);

const visiblePeers = computed(() => {
  const query = search.value.trim().toLowerCase();
  if (!query) return pickablePeers.value;
  return pickablePeers.value.filter((p) => (p.name || p.id).toLowerCase().includes(query));
});

const rootStyle = computed(() => ({
  color: 'var(--pg-text)',
  fontFamily: 'var(--pg-font)',
}));

const mateNames = computed(() =>
  myGroupMates.value.map((m) => m.name || m.emoji || m.id).join(', '),
);

function groupLabel(group: Group): string {
  const groups = (slideAttributesProps.value?.groups ?? []) as Group[];
  const index = groups.findIndex((g) => g.id === group.id);
  return t('Group {number}', { number: index + 1 });
}

function isSelected(id: string): boolean {
  return selected.value.includes(id);
}
function isDisabled(id: string): boolean {
  return !isSelected(id) && selected.value.length >= PICK_LIMIT;
}
function toggle(id: string): void {
  if (isSelected(id)) selected.value = selected.value.filter((x) => x !== id);
  else if (selected.value.length < PICK_LIMIT) selected.value = [...selected.value, id];
}

function peerStyle(id: string): Record<string, string> {
  if (isSelected(id)) {
    return {
      borderColor: 'var(--pg-text)',
      background: `color-mix(in srgb, ${accent.value} 8%, var(--aha-colorBgContainer))`,
    };
  }
  return { borderColor: 'var(--pg-border)', background: 'var(--aha-colorBgContainer)' };
}

const submitStyle = computed(() => {
  if (submitting.value) {
    return { background: 'var(--pg-accent)', color: readableInk(accent.value), opacity: '0.85' };
  }
  return {
    background: 'var(--pg-accent)',
    color: readableInk(accent.value),
    border: '1px solid color-mix(in srgb, var(--pg-text) 10%, transparent)',
  };
});

async function onSubmit(): Promise<void> {
  try {
    await grouping.submitPicks(selected.value);
    showToastSuccess?.(t('You\'re all set'));
  } catch {
    showToastError?.(t('Could not submit your picks. Please try again.'));
  }
}
function onEdit(): void {
  grouping.editPicks();
}

function reportSubmitOffset(): void {
  if (submitRef.value && onSubmitButtonHeightChange) {
    onSubmitButtonHeightChange(submitRef.value.offsetTop);
  }
}
watch([visiblePeers, submitting, submitted, revealed], () => requestAnimationFrame(reportSubmitOffset));

onMounted(async () => {
  const priorPicks = await grouping.loadExistingSubmission();
  if (priorPicks.length) selected.value = priorPicks;
  requestAnimationFrame(reportSubmitOffset);
});
</script>

<style scoped>
.pg-audience {
  box-sizing: border-box;
  width: 100%;
  max-width: 840px;
  margin: 0 auto;
  padding: 16px;
  background: var(--aha-colorBgLayout);
  font-size: 16px;
  line-height: 1.5;
}
.pg-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.pg-centered {
  align-items: center;
  text-align: center;
  padding: 24px 16px;
}
.pg-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.pg-title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}
.pg-tagline {
  margin: 0;
  font-size: 14px;
  opacity: 0.75;
}
.pg-help {
  margin: 0;
  font-size: 14px;
  opacity: 0.7;
}
.pg-count {
  margin: 0;
  font-size: 14px;
  opacity: 0.75;
}
.pg-search {
  width: 100%;
  box-sizing: border-box;
  height: 44px;
  padding: 0 12px;
  font-size: 16px;
  color: var(--pg-text);
  background: var(--aha-colorBgContainer);
  border: 1px solid var(--pg-border);
  border-radius: 8px;
  outline: none;
}
.pg-peers {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 46vh;
  overflow-y: auto;
}
.pg-peer {
  width: 100%;
  box-sizing: border-box;
  min-height: 48px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  font-size: 16px;
  color: var(--pg-text);
  border: 1px solid var(--pg-border);
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
}
.pg-peer--on {
  border-width: 2px;
  font-weight: 600;
}
.pg-peer--off {
  opacity: 0.5;
  cursor: not-allowed;
}
.pg-peer__emoji {
  font-size: 20px;
  line-height: 1;
}
.pg-peer__name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pg-peer__mark {
  width: 20px;
  text-align: center;
  color: var(--pg-accent);
  font-weight: 600;
}
.pg-empty {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 24px 8px;
  text-align: center;
}
.pg-empty__title {
  margin: 0;
  font-weight: 600;
}
.pg-submit {
  width: 100%;
  box-sizing: border-box;
  min-height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
  padding: 0 16px;
  font-size: 16px;
  font-weight: 600;
  font-family: inherit;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.pg-submit:disabled {
  cursor: default;
}
.pg-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: pg-spin 0.7s linear infinite;
}
@keyframes pg-spin {
  to {
    transform: rotate(360deg);
  }
}
.pg-link {
  align-self: center;
  background: none;
  border: none;
  padding: 4px 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--pg-accent);
  cursor: pointer;
}
.pg-check {
  width: 56px;
  height: 56px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 28px;
}
.pg-your-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
}
.pg-your-group__badge {
  align-self: stretch;
  padding: 16px;
  border-radius: 8px;
  font-size: 20px;
  font-weight: 600;
  text-align: center;
}
.pg-with {
  margin: 0;
  font-size: 14px;
  opacity: 0.75;
}
.pg-mates {
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.pg-mate {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 48px;
  padding: 8px 12px;
  border: 1px solid var(--pg-border);
  border-radius: 8px;
}
.pg-mate__emoji {
  font-size: 20px;
}
.pg-solo {
  margin: 0;
  font-size: 16px;
  opacity: 0.8;
}
.pg-skeleton {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}
.pg-skeleton__line,
.pg-skeleton__row,
.pg-skeleton__button {
  border-radius: 8px;
  background: color-mix(in srgb, currentColor 8%, transparent);
}
.pg-skeleton__line {
  height: 24px;
  width: 70%;
}
.pg-skeleton__row {
  height: 48px;
}
.pg-skeleton__button {
  height: 46px;
  margin-top: 8px;
}
</style>
