<template>
  <div class="min-h-screen bg-base-10 p-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-base-100 mb-2">Custom Aha Icons V2</h1>
      <p class="text-base-70">Dynamic icon loading with the globally registered &lt;aha-icon&gt; component - No imports needed!</p>
      <a-tag color="green" class="mt-2">✨ NEW: Zero Import Solution</a-tag>
    </div>

    <!-- Navigation -->
    <div class="mb-6 flex gap-3">
      <a-button type="link" @click="$router.back()">
        ← Back
      </a-button>
      <a-button type="default" @click="$router.push('/icons')">
        View V1 (Import-based)
      </a-button>
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

    <!-- Usage Examples -->
    <div class="mt-8 bg-white rounded-xl p-8 shadow-lg border border-base-20">
      <h2 class="text-2xl font-bold text-base-100 mb-6 flex items-center gap-2">
        <BulbOutlined class="text-purple-60" />
        Usage Examples - No Imports Required!
      </h2>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Different Sizes -->
        <div class="example-card">
          <h3 class="example-title">
            <ExpandOutlined />
            Different Sizes
          </h3>
          <div class="example-content">
            <div class="flex items-end justify-center gap-4 p-6 bg-linear-to-br from-purple-50 to-blue-50 rounded-lg">
              <aha-icon name="system-star" width="20px" height="20px" class="text-purple-60" />
              <aha-icon name="system-star" width="24px" height="24px" class="text-purple-60" />
              <aha-icon name="system-star" width="32px" height="32px" class="text-purple-60" />
              <aha-icon name="system-star" width="40px" height="40px" class="text-purple-60" />
              <aha-icon name="system-star" width="48px" height="48px" class="text-purple-60" />
            </div>
            <div class="mt-3 bg-base-100 text-white p-3 rounded font-mono text-xs">
              <div>&lt;aha-icon name="system-star" width="32px" height="32px" /&gt;</div>
            </div>
          </div>
        </div>

        <!-- Different Colors -->
        <div class="example-card">
          <h3 class="example-title">
            <BgColorsOutlined />
            Different Colors
          </h3>
          <div class="example-content">
            <div class="flex items-center justify-center gap-4 p-6 bg-linear-to-br from-emerald-50 to-teal-50 rounded-lg flex-wrap">
              <aha-icon name="system-heart-straight" width="40px" height="40px" class="text-red-500" />
              <aha-icon name="system-heart-straight" width="40px" height="40px" class="text-purple-60" />
              <aha-icon name="system-heart-straight" width="40px" height="40px" class="text-emerald-60" />
              <aha-icon name="system-heart-straight" width="40px" height="40px" class="text-coral-60" />
              <aha-icon name="system-heart-straight" width="40px" height="40px" class="text-blue-60" />
            </div>
            <div class="mt-3 bg-base-100 text-white p-3 rounded font-mono text-xs">
              <div>&lt;aha-icon name="system-heart-straight" class="text-purple-60" /&gt;</div>
            </div>
          </div>
        </div>

        <!-- With Backgrounds -->
        <div class="example-card">
          <h3 class="example-title">
            <FormatPainterOutlined />
            With Backgrounds
          </h3>
          <div class="example-content">
            <div class="flex items-center justify-center gap-4 p-6 bg-base-10 rounded-lg flex-wrap">
              <div class="icon-bg bg-purple-60">
                <aha-icon name="system-gift" width="32px" height="32px" class="text-white" />
              </div>
              <div class="icon-bg bg-emerald-60 rounded-full">
                <aha-icon name="system-bell" width="32px" height="32px" class="text-white" />
              </div>
              <div class="icon-bg bg-coral-60">
                <aha-icon name="system-fire" width="32px" height="32px" class="text-white" />
              </div>
              <div class="icon-bg bg-blue-60 rounded-full">
                <aha-icon name="system-sparkle" width="32px" height="32px" class="text-white" />
              </div>
            </div>
            <div class="mt-3 bg-base-100 text-white p-3 rounded font-mono text-xs">
              <div>&lt;aha-icon name="system-gift" width="32px" /&gt;</div>
            </div>
          </div>
        </div>

        <!-- Usage Example -->
        <div class="example-card">
          <h3 class="example-title">
            <CodeOutlined />
            Usage - No Import Needed!
          </h3>
          <div class="example-content">
            <div class="bg-base-100 text-white p-4 rounded-lg font-mono text-sm space-y-2">
              <div class="text-gray-400">// Just use it directly in template</div>
              <div>&lt;template&gt;</div>
              <div class="ml-4">&lt;aha-icon</div>
              <div class="ml-8">name=<span class="text-amber-300">"system-star"</span></div>
              <div class="ml-8">width=<span class="text-amber-300">"24px"</span></div>
              <div class="ml-8">height=<span class="text-amber-300">"24px"</span></div>
              <div class="ml-8">class=<span class="text-amber-300">"text-purple-60"</span></div>
              <div class="ml-4">/&gt;</div>
              <div>&lt;/template&gt;</div>
            </div>
            <a-button type="primary" block class="mt-3" @click="copyExampleUsage">
              <CopyOutlined /> Copy Usage
            </a-button>
          </div>
        </div>
      </div>

      <!-- Quick Tips -->
      <a-alert
        class="mt-6"
        message="💡 V2 Benefits"
        type="success"
        show-icon
      >
        <template #description>
          <ul class="list-disc list-inside space-y-1 text-sm">
            <li><strong>No imports needed</strong> - Just use <code class="bg-emerald-100 px-1 rounded">&lt;aha-icon name="system-star" /&gt;</code> directly</li>
            <li><strong>Consistent naming</strong> - Icon name matches the file name exactly</li>
            <li><strong>Dynamic loading</strong> - Icons are loaded on-demand for better performance</li>
            <li><strong>Globally registered</strong> - Available in all components automatically</li>
            <li><strong>Type-safe</strong> - Full TypeScript support in your IDE</li>
          </ul>
        </template>
      </a-alert>

      <!-- Comparison -->
      <a-divider>V1 vs V2 Comparison</a-divider>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a-card title="V1: Import-based" size="small">
          <div class="bg-base-100 text-white p-3 rounded font-mono text-xs space-y-1">
            <div class="text-red-400">// Need to import first</div>
            <div><span class="text-purple-400">import</span> IconSystemStar</div>
            <div class="ml-4"><span class="text-purple-400">from</span> <span class="text-amber-300">'~icons/aha/system-star'</span></div>
            <div class="mt-2">&lt;IconSystemStar /&gt;</div>
          </div>
          <div class="mt-2 text-xs text-base-70">
            ❌ Import statement required<br>
            ❌ Component name != file name
          </div>
        </a-card>
        <a-card title="V2: Zero-import" size="small" class="border-emerald-400">
          <div class="bg-base-100 text-white p-3 rounded font-mono text-xs space-y-1">
            <div class="text-emerald-400">// No import needed!</div>
            <div>&lt;aha-icon name=<span class="text-amber-300">"system-star"</span> /&gt;</div>
          </div>
          <div class="mt-2 text-xs text-emerald-700">
            ✅ Zero imports<br>
            ✅ Name matches file name
          </div>
        </a-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { message } from 'ant-design-vue';
import { 
  SearchOutlined, 
  AppstoreOutlined, 
  FilterOutlined, 
  CopyOutlined,
  BulbOutlined,
  ExpandOutlined,
  BgColorsOutlined,
  FormatPainterOutlined,
  CodeOutlined,
  ThunderboltOutlined
} from '@ant-design/icons-vue';

// Enable scrolling for this page
onMounted(() => {
  document.body.classList.add('enable-scroll');
});

onBeforeUnmount(() => {
  document.body.classList.remove('enable-scroll');
});

// Search state
const searchQuery = ref('');

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

// Filter icons based on search
const filteredIcons = computed(() => {
  if (!searchQuery.value) return allIcons.value;
  const query = searchQuery.value.toLowerCase();
  return allIcons.value.filter(icon => icon.toLowerCase().includes(query));
});

// Format icon name for display
const formatIconName = (iconName: string): string => {
  return iconName
    .replace('system-', '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};

// Copy icon usage to clipboard
const copyIconUsage = (iconName: string) => {
  const usage = `<aha-icon name="${iconName}" width="24px" height="24px" />`;
  navigator.clipboard.writeText(usage);
  message.success('Icon usage copied to clipboard!');
};

// Copy example usage
const copyExampleUsage = () => {
  const usage = `<aha-icon name="system-star" width="24px" height="24px" class="text-purple-60" />`;
  navigator.clipboard.writeText(usage);
  message.success('Example usage copied to clipboard!');
};
</script>

<style scoped>
.stat-card {
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: #10b981;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
  transform: translateY(-2px);
}

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
  position: relative;
  overflow: hidden;
}

.icon-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.icon-card:hover {
  border-color: #10b981;
  background: #f0fdf4;
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.15);
  transform: translateY(-4px) scale(1.05);
}

.icon-card:hover::before {
  opacity: 1;
}

.icon-card:active {
  transform: translateY(-2px) scale(1.02);
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #f9fafb;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.icon-card:hover .icon-wrapper {
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.icon {
  color: #4b5563;
  transition: all 0.3s ease;
}

.icon-card:hover .icon {
  color: #10b981;
  transform: scale(1.1);
}

.icon-name {
  font-size: 10px;
  line-height: 1.2;
  text-align: center;
  color: #6b7280;
  font-weight: 500;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-word;
  position: relative;
  z-index: 1;
  transition: color 0.3s ease;
}

.icon-card:hover .icon-name {
  color: #10b981;
}

/* Animation for newly loaded icons */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.icon-card {
  animation: fadeInUp 0.4s ease backwards;
}

.icon-card:nth-child(n) {
  animation-delay: calc(var(--index, 0) * 0.02s);
}

/* Example Cards */
.example-card {
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 20px;
  background: white;
  transition: all 0.3s ease;
}

.example-card:hover {
  border-color: #e0e0e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.example-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.example-content {
  margin-top: 12px;
}

.icon-bg {
  padding: 16px;
  border-radius: 12px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-bg:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}
</style>

