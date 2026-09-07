<template>
  <a-config-provider :theme="theme">
    <div class="pg-settings">
      <div class="pg-row">
        <span class="pg-row__label">
          {{ t('Group size') }}
          <a-tooltip :title="t('Groups are formed to this size where the headcount allows.')">
            <span class="pg-help" tabindex="0" role="img" :aria-label="t('Group size')">?</span>
          </a-tooltip>
        </span>
        <span class="pg-row__control">
          <a-input-number
            v-model:value="targetSize"
            :min="MIN_TARGET"
            :max="MAX_TARGET"
            :precision="0"
            data-testid="settings-preference-grouping-target-size"
            @change="onChange"
          />
          <span class="pg-unit">{{ t('people per group') }}</span>
        </span>
      </div>
    </div>
  </a-config-provider>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useI18n } from '../i18n';
import { usePresenterPlugin, useSync } from '@aha/ui';
import { useTheme } from '../composables/useTheme';
import { syncLocale } from '../i18n';
import { ATTR_TARGET_SIZE, DEFAULT_TARGET_SIZE, MIN_GROUP_SIZE, readStoredTargetSize, syncKey } from '../constants';

const MIN_TARGET = MIN_GROUP_SIZE;
const MAX_TARGET = 12;

const { t } = useI18n();

const {
  presentationProps,
  presentationColorPaletteProps,
  presentationLighterColorPaletteProps,
  slideProps,
  currentUserProps,
  getSlideAttributesAction,
  upsertSlideAttributeAction,
} = usePresenterPlugin({ autoHeight: true });

const { theme } = useTheme({
  fontFamily: computed(() => presentationProps.value?.fontFamily),
  textColour: computed(() => slideProps.value?.textColour),
  palette: presentationColorPaletteProps,
  lighterPalette: presentationLighterColorPaletteProps,
});

// Settings chrome follows the PRESENTER'S app locale, not the deck content language.
watch(
  () => currentUserProps.value?.presenterLanguage ?? presentationProps.value?.language,
  (language) => syncLocale(language),
  { immediate: true },
);

const slideId = computed(() => slideProps.value?.id);
const targetSize = useSync<number>(
  computed(() => (slideId.value ? syncKey.targetSize(slideId.value) : undefined)),
  DEFAULT_TARGET_SIZE,
);

function persist(value: number): void {
  upsertSlideAttributeAction?.({
    slideId: slideId.value,
    attributeKey: ATTR_TARGET_SIZE,
    attributeValue: value,
  });
}

function onChange(value: number | null): void {
  if (value == null) return;
  const clamped = Math.min(MAX_TARGET, Math.max(MIN_TARGET, Math.round(value)));
  targetSize.value = clamped;
  persist(clamped);
}

onMounted(async () => {
  if (!slideId.value || !getSlideAttributesAction) return;
  try {
    const attributes = await getSlideAttributesAction(slideId.value);
    const stored = readStoredTargetSize(attributes);
    if (stored != null) targetSize.value = stored;
  } catch (error) {
    console.warn('[preferenceGrouping] could not load settings', error);
  }
});
</script>

<style scoped>
.pg-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  font-family: var(--pg-font);
}
.pg-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.pg-row__label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}
.pg-row__control {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.pg-unit {
  font-size: 14px;
  opacity: 0.7;
  white-space: nowrap;
}
.pg-help {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  font-size: 11px;
  cursor: help;
  color: color-mix(in srgb, currentColor 55%, transparent);
  border: 1px solid color-mix(in srgb, currentColor 25%, transparent);
}
</style>
