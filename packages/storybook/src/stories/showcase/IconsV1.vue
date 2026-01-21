<template>
  <a-config-provider :theme="ahaSlidesDefaultTheme">  
  <div class="p-8 bg-base-10">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-base-100 mb-2">Custom Aha Icons</h1>
      <p class="text-base-70">All custom SVG icons loaded via unplugin-icons from @aha/ui package</p>
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
        <a-statistic title="Total Icons" :value="icons.length">
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
        <a-statistic title="Click to Copy" value="Import">
          <template #prefix>
            <CopyOutlined class="text-coral-60" />
          </template>
        </a-statistic>
      </a-card>
    </div>

    <!-- Icon Grid -->
    <div class="bg-white rounded-xl p-8 shadow-lg border border-base-20">
      <div v-if="filteredIcons.length > 0" class="flex flex-wrap gap-3">
        <a-tooltip
          v-for="icon in filteredIcons"
          :key="icon.name"
          :title="`Click to copy: ${icon.name}`"
          placement="top"
        >
          <div
            class="icon-card"
            @click="copyIconImport(icon.name)"
          >
            <div class="icon-wrapper">
              <component :is="icon.component" class="icon" />
            </div>
            <span class="icon-name">{{ icon.displayName }}</span>
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
import { ref, computed } from 'vue';
import { message } from 'ant-design-vue';
import { 
  SearchOutlined, 
  AppstoreOutlined, 
  FilterOutlined, 
  CopyOutlined,
} from '@ant-design/icons-vue';
import { ahaSlidesDefaultTheme } from '@aha/ui';

// Import essential icons for showcase
import IconSystemAlignCenter from '~icons/aha/system-align-center';
import IconSystemAlignLeft from '~icons/aha/system-align-left';
import IconSystemAlignRight from '~icons/aha/system-align-right';
import IconSystemAnimation from '~icons/aha/system-animation';
import IconSystemStar from '~icons/aha/system-star';
import IconSystemHeart from '~icons/aha/system-heart-straight';
import IconSystemBell from '~icons/aha/system-bell';
import IconSystemFire from '~icons/aha/system-fire';
import IconSystemGift from '~icons/aha/system-gift';
import IconSystemSparkle from '~icons/aha/system-sparkle';

// Search state
const searchQuery = ref('');

// Icons list
const icons = ref([
  { name: 'system-align-center', component: IconSystemAlignCenter, displayName: 'AlignCenter' },
  { name: 'system-align-left', component: IconSystemAlignLeft, displayName: 'AlignLeft' },
  { name: 'system-align-right', component: IconSystemAlignRight, displayName: 'AlignRight' },
  { name: 'system-animation', component: IconSystemAnimation, displayName: 'Animation' },
  { name: 'system-star', component: IconSystemStar, displayName: 'Star' },
  { name: 'system-heart-straight', component: IconSystemHeart, displayName: 'Heart' },
  { name: 'system-bell', component: IconSystemBell, displayName: 'Bell' },
  { name: 'system-fire', component: IconSystemFire, displayName: 'Fire' },
  { name: 'system-gift', component: IconSystemGift, displayName: 'Gift' },
  { name: 'system-sparkle', component: IconSystemSparkle, displayName: 'Sparkle' },
]);

// Filter icons based on search
const filteredIcons = computed(() => {
  if (!searchQuery.value) return icons.value;
  const query = searchQuery.value.toLowerCase();
  return icons.value.filter(icon => 
    icon.name.toLowerCase().includes(query) || 
    icon.displayName.toLowerCase().includes(query)
  );
});

// Copy icon import to clipboard
const copyIconImport = (iconName: string) => {
  const importStatement = `import Icon${iconName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')} from '~icons/aha/${iconName}'`;
  navigator.clipboard.writeText(importStatement);
  message.success('Import statement copied to clipboard!');
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
  border-color: #9333ea;
  background: #faf5ff;
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
  width: 32px;
  height: 32px;
  color: #4b5563;
}

.icon-card:hover .icon {
  color: #9333ea;
}

.icon-name {
  font-size: 10px;
  text-align: center;
  color: #6b7280;
}
</style>
