<script setup lang="ts">
import { computed } from 'vue';
import { Button as AntButton, ConfigProvider } from 'ant-design-vue';
import { themeConfig } from '../tokens';
import { expandState } from '../contract';

type ButtonVariant = 'primary' | 'default' | 'dashed' | 'text' | 'link';
type ButtonSize = 'small' | 'middle' | 'large';
type ButtonState = 'default' | 'disabled' | 'loading';

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant;
    size?: ButtonSize;
    state?: ButtonState;
    danger?: boolean;
    block?: boolean;
  }>(),
  {
    variant: 'default',
    size: 'middle',
    state: 'default',
    danger: false,
    block: false,
  },
);

const expanded = computed(() => expandState(props.state));
</script>

<template>
  <ConfigProvider :theme="themeConfig">
    <AntButton
      :type="props.variant"
      :size="props.size"
      :disabled="expanded.disabled"
      :loading="expanded.loading"
      :danger="props.danger"
      :block="props.block"
    >
      <template v-if="$slots.icon" #icon><slot name="icon" /></template>
      <slot />
    </AntButton>
  </ConfigProvider>
</template>
