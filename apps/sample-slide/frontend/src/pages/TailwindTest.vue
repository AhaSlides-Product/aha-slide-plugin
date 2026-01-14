<template>
  <div class="p-8 bg-red-50">
    <p class="text-helpFullLink">Helpful link</p>
    <!-- ====================================== -->
    <!-- TAILWIND CSS VALIDATION TEST SECTION -->
    <!-- ====================================== -->
    <div class="mt-8 p-6 bg-gradient-to-r from-purple-50 to-emerald-10 rounded-xl border-2 border-purple-60 shadow-lg">
      <h2 class="text-3xl font-bold text-purple-60 mb-6">🎨 Tailwind CSS Test Section</h2>
      
      <!-- Colors Test -->
      <div class="flex flex-row space-between gap-4">
        <p>item 1</p>
        <p>item 2</p>
        <p>item 3</p>
      </div>

      <!-- Layout Test -->
      <div class="mb-6">
        <h3 class="text-xl font-semibold text-base-100 mb-3">Layout & Spacing</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="p-4 bg-white rounded-lg border border-base-30 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-purple-60 rounded-full flex items-center justify-center text-white font-bold">1</div>
              <span class="text-base-90 font-medium">Flexbox + Gap</span>
            </div>
            <p class="text-sm text-base-70">Using flex, items-center, gap-3</p>
          </div>
          <div class="p-4 bg-white rounded-lg border border-base-30 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-emerald-60 rounded-full flex items-center justify-center text-white font-bold">2</div>
              <span class="text-base-90 font-medium">Grid Layout</span>
            </div>
            <p class="text-sm text-base-70">Using grid-cols-3, gap-4</p>
          </div>
          <div class="p-4 bg-white rounded-lg border border-base-30 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-coral-60 rounded-full flex items-center justify-center text-white font-bold">3</div>
              <span class="text-base-90 font-medium">Responsive</span>
            </div>
            <p class="text-sm text-base-70">Adapts on different screens</p>
          </div>
        </div>
      </div>

      <!-- Typography Test -->
      <div class="mb-6">
        <h3 class="text-xl font-semibold text-base-100 mb-3">Typography</h3>
        <div class="space-y-2 bg-white p-4 rounded-lg border border-base-30">
          <p class="text-xs text-base-70">Extra Small (text-xs)</p>
          <p class="text-sm text-base-80">Small (text-sm)</p>
          <p class="text-base text-base-90">Base (text-base)</p>
          <p class="text-lg text-base-100 font-medium">Large & Medium (text-lg font-medium)</p>
          <p class="text-xl text-purple-60 font-semibold">X-Large & Semibold (text-xl font-semibold)</p>
          <p class="text-2xl text-emerald-60 font-bold">2X-Large & Bold (text-2xl font-bold)</p>
        </div>
      </div>

      <!-- Integration with Ant Design -->
      <div class="mb-6">
        <h3 class="text-xl font-semibold text-base-100 mb-3">Tailwind + Ant Design Integration</h3>
        <div class="flex flex-wrap gap-4 items-center">
          <a-button type="primary" class="shadow-lg">Primary Button</a-button>
          <a-button class="shadow-lg">Default Button</a-button>
          <a-button type="dashed" class="shadow-lg">Dashed Button</a-button>
          <div class="px-6 py-3 bg-gradient-to-r from-purple-60 to-purple-50 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            Custom Tailwind Button
          </div>
        </div>
      </div>

      <!-- Responsive Test -->
      <div class="p-4 bg-yellow-10 border-l-4 border-yellow-50 rounded">
        <p class="text-sm text-base-90">
          <span class="font-semibold">✅ If you can see this styled section with proper colors, spacing, and layouts, Tailwind is working!</span>
        </p>
        <p class="text-xs text-base-70 mt-2">Try resizing the window to test responsive grid layout above.</p>
      </div>

      <!-- Additional Tests -->
      <div class="mt-8">
        <h3 class="text-xl font-semibold text-base-100 mb-3">Additional Utility Tests</h3>
        
        <!-- Spacing Test -->
        <div class="mb-4 p-4 bg-white rounded-lg border border-base-30">
          <h4 class="font-semibold text-base-90 mb-3">Spacing Scale</h4>
          <div class="space-y-2">
            <div class="p-1 bg-purple-30 rounded">p-1 (4px)</div>
            <div class="p-2 bg-purple-30 rounded">p-2 (8px)</div>
            <div class="p-3 bg-purple-30 rounded">p-3 (12px)</div>
            <div class="p-4 bg-purple-30 rounded">p-4 (16px)</div>
            <div class="p-6 bg-purple-30 rounded">p-6 (24px)</div>
          </div>
        </div>

        <!-- Border Radius Test -->
        <div class="mb-4 p-4 bg-white rounded-lg border border-base-30">
          <h4 class="font-semibold text-base-90 mb-3">Border Radius</h4>
          <div class="flex flex-wrap gap-3">
            <div class="px-4 py-2 bg-emerald-60 text-white rounded-none">rounded-none</div>
            <div class="px-4 py-2 bg-emerald-60 text-white rounded-sm">rounded-sm</div>
            <div class="px-4 py-2 bg-emerald-60 text-white rounded">rounded</div>
            <div class="px-4 py-2 bg-emerald-60 text-white rounded-lg">rounded-lg</div>
            <div class="px-4 py-2 bg-emerald-60 text-white rounded-xl">rounded-xl</div>
            <div class="px-4 py-2 bg-emerald-60 text-white rounded-full">rounded-full</div>
          </div>
        </div>

        <!-- Shadow Test -->
        <div class="mb-4 p-4 bg-white rounded-lg border border-base-30">
          <h4 class="font-semibold text-base-90 mb-3">Shadows</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-4 bg-white shadow-sm rounded-lg border border-base-20">shadow-sm</div>
            <div class="p-4 bg-white shadow rounded-lg border border-base-20">shadow</div>
            <div class="p-4 bg-white shadow-md rounded-lg border border-base-20">shadow-md</div>
            <div class="p-4 bg-white shadow-lg rounded-lg border border-base-20">shadow-lg</div>
            <div class="p-4 bg-white shadow-xl rounded-lg border border-base-20">shadow-xl</div>
            <div class="p-4 bg-white shadow-2xl rounded-lg border border-base-20">shadow-2xl</div>
          </div>
        </div>

        <!-- Hover & Transition Test -->
        <div class="p-4 bg-white rounded-lg border border-base-30">
          <h4 class="font-semibold text-base-90 mb-3">Hover Effects & Transitions</h4>
          <div class="flex flex-wrap gap-3">
            <button class="px-4 py-2 bg-purple-60 text-white rounded hover:bg-purple-70 transition-colors">
              Hover Color Change
            </button>
            <button class="px-4 py-2 bg-emerald-60 text-white rounded hover:scale-110 transition-transform">
              Hover Scale
            </button>
            <button class="px-4 py-2 bg-coral-60 text-white rounded hover:shadow-xl transition-shadow">
              Hover Shadow
            </button>
            <button class="px-4 py-2 bg-red-100 text-white rounded hover:opacity-80 transition-opacity">
              Hover Opacity
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Back -->
    <div class="mt-8 flex justify-center">
      <a-button type="link" @click="$router.back()" class="text-lg">
        ← Back to Settings
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.text-helpFullLink {
  color: var(--ant-colorThankful);
}
</style>

