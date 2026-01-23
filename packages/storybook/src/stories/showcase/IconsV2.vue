<template>
  <a-config-provider :theme="ahaSlidesDefaultTheme">  
  <div class="p-8 bg-base-10">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-base-100 mb-2">Custom Aha Icons V2</h1>
      <p class="text-base-70">Dynamic icon loading with the globally registered &lt;aha-icon&gt; component - No imports needed!</p>
      <a-tag color="green" class="mt-2">✨ NEW: Zero Import Solution</a-tag>
    </div>

    <!-- Search and Filter -->
    <div class="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <a-input-search
        v-model:value="searchQuery"
        placeholder="Search icons by name..."
        size="large"
        allow-clear
        class="flex-1"
        style="max-width: 500px"
      >
        <template #prefix>
          <SearchOutlined />
        </template>
      </a-input-search>
    </div>

    <!-- Stats -->
    <div class="mb-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
      <a-card size="small" class="stat-card">
        <a-statistic title="Total Icons" :value="allIcons.length">
          <template #prefix>
            <AppstoreOutlined class="text-purple-60" />
          </template>
        </a-statistic>
      </a-card>
      <a-card size="small" class="stat-card">
        <a-statistic title="Showing" :value="filteredIcons.length">
          <template #prefix>
            <FilterOutlined class="text-emerald-60" />
          </template>
        </a-statistic>
      </a-card>
      <a-card size="small" class="stat-card">
        <a-statistic title="Zero Imports" value="✨">
          <template #prefix>
            <ThunderboltOutlined class="text-coral-60" />
          </template>
        </a-statistic>
      </a-card>
    </div>

    <!-- Icon Grid -->
    <div class="bg-white rounded-xl p-8 shadow-lg border border-base-20">
      <div v-if="filteredIcons.length > 0" class="flex flex-wrap gap-3">
        <a-tooltip
          v-for="icon in filteredIcons"
          :key="icon"
          :title="`Click to copy: <aha-icon name=&quot;${icon}&quot; />`"
          placement="top"
        >
          <div
            class="icon-card"
            @click="copyIconUsage(icon)"
          >
            <div class="icon-wrapper">
              <aha-icon :name="icon" width="32px" height="32px" class="icon" />
            </div>
            <span class="icon-name">{{ formatIconName(icon) }}</span>
          </div>
        </a-tooltip>
      </div>

      <!-- Empty state -->
      <a-empty v-if="filteredIcons.length === 0" description="No icons found">
        <a-button type="primary" @click="searchQuery = ''">Clear Search</a-button>
      </a-empty>
    </div>
  </div>
  </a-config-provider>
</template>

<script setup lang="ts">
import { ahaSlidesDefaultTheme } from '@aha/ui';
import { ref, computed } from 'vue';
import { message } from 'ant-design-vue';
import { 
  SearchOutlined, 
  AppstoreOutlined, 
  FilterOutlined, 
  ThunderboltOutlined
} from '@ant-design/icons-vue';

// Search state
const searchQuery = ref('');

// Icon names
// All icons list - just the names!
const allIcons = ref([
  'system-align-center', 'system-align-left', 'system-align-right', 'system-animation',
  'system-arrow-clockwise', 'system-arrow-counter-clockwise', 'system-arrow-down',
  'system-arrow-left', 'system-arrow-right', 'system-arrow-square-out',
  'system-arrow-u-up-left', 'system-arrow-u-up-right', 'system-arrow-up',
  'system-arrows-clockwise', 'system-arrows-down-up', 'system-arrows-in-simple',
  'system-arrows-left-right', 'system-arrows-out-cardinal', 'system-arrows-out-simple',
  'system-asterisk', 'system-backstage', 'system-bell', 'system-book',
  'system-bookmark-simple', 'system-briefcase', 'system-calendar-dot',
  'system-calendar-dots', 'system-cards-three', 'system-caret-down',
  'system-caret-left', 'system-caret-right', 'system-caret-up',
  'system-chart-bar', 'system-chart-donut', 'system-chart-line-up',
  'system-chart-pie', 'system-chat-add', 'system-chat-centered-text',
  'system-chat-circle', 'system-chat-text', 'system-chats-circle',
  'system-check-circle', 'system-check', 'system-circle-notch',
  'system-confetti', 'system-copy', 'system-credit-card',
  'system-currency-circle-dollar', 'system-cursor-click', 'system-device-mobile',
  'system-document-check', 'system-dots-three-vertical', 'system-dots-three',
  'system-download-simple', 'system-drag', 'system-drum', 'system-duplicate',
  'system-emoji-bubble', 'system-envelop', 'system-envelope', 'system-equation',
  'system-exclamation-mark', 'system-export', 'system-eye-slash', 'system-eye',
  'system-file-arrow-down', 'system-file-arrow-in', 'system-file-arrow-up',
  'system-file-audio', 'system-file-check', 'system-file-xls', 'system-file',
  'system-fire', 'system-folder-2', 'system-folder-simple-arrow',
  'system-folder-simple-plus', 'system-folder-user', 'system-folder',
  'system-form', 'system-frame-corners', 'system-gear', 'system-gif',
  'system-gift', 'system-globe-simple', 'system-hand-pointing', 'system-hand',
  'system-hands-clapping', 'system-heart-straight', 'system-hourglass-high',
  'system-house', 'system-identification-card', 'system-image-square',
  'system-images', 'system-info', 'system-invoice', 'system-k-square',
  'system-key-return', 'system-layout', 'system-lightbulb-filament',
  'system-line-weight', 'system-link', 'system-list-1', 'system-list-numbers',
  'system-list', 'system-lock-open', 'system-lock', 'system-magic-wand',
  'system-magnifying-glass', 'system-microphone', 'system-microsoft-excel-logo',
  'system-minus-square', 'system-minus', 'system-money-back',
  'system-music-notes-simple', 'system-music-notes', 'system-note-filled',
  'system-note', 'system-number-one', 'system-palette', 'system-paper-clip',
  'system-paste', 'system-pause', 'system-pencil-simple-line',
  'system-pencil-simple', 'system-percent', 'system-pinned-filled',
  'system-plan', 'system-play', 'system-plus-square', 'system-plus',
  'system-presentation-chart-one', 'system-presentation-chart',
  'system-presentation-connect', 'system-presentation-disconnect',
  'system-projector-screen-chart', 'system-push-pin', 'system-q&a',
  'system-qr-code', 'system-question', 'system-remote', 'system-rows',
  'system-scissors', 'system-shapes', 'system-share-network',
  'system-shield-check', 'system-shield-warning', 'system-shuffle',
  'system-sign-out', 'system-sliders-horizontal', 'system-smiley',
  'system-sparkle', 'system-speaker-simple-high', 'system-speaker-simple-x',
  'system-squares-four', 'system-stack-simple', 'system-stack', 'system-star',
  'system-stop', 'system-table', 'system-text-t', 'system-thumbs-down',
  'system-thumbs-up', 'system-timer', 'system-trash', 'system-trend-down',
  'system-trend-up', 'system-trophy-slash', 'system-trophy',
  'system-upload-simple', 'system-user-circle', 'system-user-plus',
  'system-user', 'system-users-three', 'system-users', 'system-video',
  'system-wallet', 'system-warning-circle', 'system-whatsapp-logo',
  'system-x-circle', 'system-x',
]);


// Filter icons
const filteredIcons = computed(() => {
  if (!searchQuery.value) return allIcons.value;
  const query = searchQuery.value.toLowerCase();
  return allIcons.value.filter(icon => icon.toLowerCase().includes(query));
});

// Format name
const formatIconName = (iconName: string): string => {
  return iconName
    .replace('system-', '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};

// Copy usage
const copyIconUsage = (iconName: string) => {
  const usage = `<aha-icon name="${iconName}" width="24px" height="24px" />`;
  navigator.clipboard.writeText(usage);
  message.success('Icon usage copied to clipboard!');
};
</script>

<style scoped>
.icon-card {
  width: 100px;
  height: 110px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 8px;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.icon-card:hover {
  border-color: #10b981;
  background: #f0fdf4;
  transform: translateY(-4px) scale(1.05);
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #f9fafb;
}

.icon {
  color: #4b5563;
}

.icon-card:hover .icon {
  color: #10b981;
}

.icon-name {
  font-size: 10px;
  text-align: center;
  color: #6b7280;
}
</style>
