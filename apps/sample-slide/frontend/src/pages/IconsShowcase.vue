<template>
  <div class="min-h-screen bg-base-10 p-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-base-100 mb-2">Custom Aha Icons</h1>
      <p class="text-base-70">All custom SVG icons loaded via unplugin-icons from @aha/ui package</p>
    </div>

    <!-- Navigation -->
    <div class="mb-6">
      <a-button type="link" @click="$router.back()">
        ← Back
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

    <!-- Usage Examples -->
    <div class="mt-8 bg-white rounded-xl p-8 shadow-lg border border-base-20">
      <h2 class="text-2xl font-bold text-base-100 mb-6 flex items-center gap-2">
        <BulbOutlined class="text-purple-60" />
        Usage Examples
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
              <IconAhaStar class="text-xl text-purple-60" />
              <IconAhaStar class="text-2xl text-purple-60" />
              <IconAhaStar class="text-3xl text-purple-60" />
              <IconAhaStar class="text-4xl text-purple-60" />
              <IconAhaStar class="text-5xl text-purple-60" />
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
              <IconAhaHeart class="text-4xl text-red-500" />
              <IconAhaHeart class="text-4xl text-purple-60" />
              <IconAhaHeart class="text-4xl text-emerald-60" />
              <IconAhaHeart class="text-4xl text-coral-60" />
              <IconAhaHeart class="text-4xl text-blue-60" />
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
                <IconAhaGift class="text-3xl text-white" />
              </div>
              <div class="icon-bg bg-emerald-60 rounded-full">
                <IconAhaBell class="text-3xl text-white" />
              </div>
              <div class="icon-bg bg-coral-60">
                <IconAhaFire class="text-3xl text-white" />
              </div>
              <div class="icon-bg bg-blue-60 rounded-full">
                <IconAhaSparkle class="text-3xl text-white" />
              </div>
            </div>
          </div>
        </div>

        <!-- Import Example -->
        <div class="example-card">
          <h3 class="example-title">
            <CodeOutlined />
            Import Example
          </h3>
          <div class="example-content">
            <div class="bg-base-100 text-white p-4 rounded-lg font-mono text-sm">
              <div class="text-emerald-400">import</div>
              <div class="ml-2">IconAhaStar</div>
              <div class="text-emerald-400">from</div>
              <div class="ml-2 text-amber-300">'~icons/aha/aha-star'</div>
            </div>
            <a-button type="primary" block class="mt-3" @click="copyExampleImport">
              <CopyOutlined /> Copy Import
            </a-button>
          </div>
        </div>
      </div>

      <!-- Quick Tips -->
      <a-alert
        class="mt-6"
        message="💡 Pro Tips"
        type="info"
        show-icon
      >
        <template #description>
          <ul class="list-disc list-inside space-y-1 text-sm">
            <li>Icons inherit <code class="bg-purple-100 px-1 rounded">currentColor</code> from parent elements</li>
            <li>Use Tailwind classes like <code class="bg-purple-100 px-1 rounded">text-2xl</code> to resize icons</li>
            <li>Click any icon in the grid above to copy its import statement</li>
            <li>All icons support hover effects and transitions</li>
          </ul>
        </template>
      </a-alert>
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
  CodeOutlined
} from '@ant-design/icons-vue';

// Import all icons dynamically
import IconAhaAlignCenter from '~icons/aha/aha-align-center';
import IconAhaAlignLeft from '~icons/aha/aha-align-left';
import IconAhaAlignRight from '~icons/aha/aha-align-right';
import IconAhaAnimation from '~icons/aha/aha-animation';
import IconAhaArrowClockwise from '~icons/aha/aha-arrow-clockwise';
import IconAhaArrowCounterClockwise from '~icons/aha/aha-arrow-counter-clockwise';


// Enable scrolling for this page
onMounted(() => {
  document.body.classList.add('enable-scroll');
});

onBeforeUnmount(() => {
  document.body.classList.remove('enable-scroll');
});

// Search state
const searchQuery = ref('');

// All icons list
const icons = ref([
  { name: 'aha-align-center', component: IconAhaAlignCenter, displayName: 'AlignCenter' },
  { name: 'aha-align-left', component: IconAhaAlignLeft, displayName: 'AlignLeft' },
  { name: 'aha-align-right', component: IconAhaAlignRight, displayName: 'AlignRight' },
  { name: 'aha-animation', component: IconAhaAnimation, displayName: 'Animation' },
  { name: 'aha-arrow-clockwise', component: IconAhaArrowClockwise, displayName: 'ArrowClockwise' },
  { name: 'aha-arrow-counter-clockwise', component: IconAhaArrowCounterClockwise, displayName: 'ArrowCounterClockwise' },
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

// Copy example import
const copyExampleImport = () => {
  const importStatement = `import IconAhaStar from '~icons/aha/aha-star'`;
  navigator.clipboard.writeText(importStatement);
  message.success('Example import copied to clipboard!');
};
</script>

<style scoped>
.stat-card {
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: #9333ea;
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.1);
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
  background: linear-gradient(135deg, rgba(147, 51, 234, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.icon-card:hover {
  border-color: #9333ea;
  background: #faf5ff;
  box-shadow: 0 8px 20px rgba(147, 51, 234, 0.15);
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
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.2);
}

.icon {
  width: 32px;
  height: 32px;
  color: #4b5563;
  transition: all 0.3s ease;
}

.icon-card:hover .icon {
  color: #9333ea;
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
  color: #9333ea;
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

