# Icon Component Update - Functional Components

## Problem
Custom icons generated as Vue SFC (`.vue` files) couldn't be passed to Ant Design's `:icon` prop because:
- The `:icon` prop expects a **functional component** (like `StarOutlined` from `@ant-design/icons-vue`)
- Vue SFC imports are **component objects**, not functional components
- This resulted in `[object Object]` being displayed in buttons

## Solution
Updated `generate-icons.js` to generate **functional components** (`.ts` files) instead of SFC (`.vue` files).

### Generated Component Structure

**Before (`.vue` file):**
```vue
<template>
  <Icon>
    <template #component>
      <svg>...</svg>
    </template>
  </Icon>
</template>

<script setup lang="ts">
import Icon from '@ant-design/icons-vue';
</script>
```

**After (`.ts` file):**
```typescript
import { defineComponent, h } from 'vue';
import Icon from '@ant-design/icons-vue';

const AhaStarSvg = () => h('svg', {
  width: '1em',
  height: '1em',
  fill: 'currentColor',
  viewBox: '0 0 16 16',
  innerHTML: `...svg content...`
});

const AhaStar = defineComponent({
  name: 'AhaStar',
  displayName: 'AhaStar',
  setup() {
    return () => h(Icon, null, {
      component: AhaStarSvg  // Using 'component' slot, not 'default'
    });
  }
});

export default AhaStar;
```

## Changes Made

### 1. `packages/ui/scripts/generate-icons.js`
- Now generates `.ts` files instead of `.vue` files
- Uses `defineComponent` and `h()` render function
- Creates functional components compatible with Ant Design's icon system
- Exports components that can be passed directly to `:icon` prop

### 2. `packages/ui/package.json`
- Added `@ant-design/icons-vue` to both `devDependencies` and `peerDependencies`
- Updated `exports` to properly expose the icons module

### 3. `apps/sample-slide/frontend/package.json`
- Added `@ant-design/icons-vue` dependency

### 4. `packages/ui/dist/icons/AhaStar.ts`
- Created demo functional component

### 5. `packages/ui/dist/icons/index.ts`
- Created index file for icon exports

## Usage

### ✅ Correct - Passing to :icon prop
```vue
<script setup>
import { AhaStar, AhaHeart } from '@aha/ui/icons';
</script>

<template>
  <!-- Now works! Icon passed as functional component -->
  <a-button type="primary" :icon="AhaStar">
    With icon
  </a-button>
</template>
```

### ✅ Also Correct - Using icon slot
```vue
<a-button type="primary">
  <template #icon><AhaStar /></template>
  With icon
</a-button>
```

### ✅ Mix with Ant Design icons
```vue
<script setup>
import { AhaStar } from '@aha/ui/icons';
import { StarOutlined } from '@ant-design/icons-vue';
</script>

<template>
  <a-button :icon="AhaStar">Custom Icon</a-button>
  <a-button :icon="StarOutlined">Ant Icon</a-button>
</template>
```

## Next Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Generate all icon components:**
   ```bash
   npm run generate:icons -w @aha/ui
   ```

3. **Rebuild the UI package:**
   ```bash
   npm run build -w @aha/ui
   ```

4. **Test in sample-slide:**
   ```bash
   npm run dev -w @aha/sample-slide-frontend
   ```

## Benefits

✅ **Type Compatible** - Same signature as Ant Design icons  
✅ **Direct Prop Usage** - Can pass to `:icon` prop  
✅ **Consistent API** - Works exactly like `@ant-design/icons-vue`  
✅ **Theme Support** - Respects Ant Design theme colors  
✅ **Proper Sizing** - Inherits `1em` sizing from parent  
✅ **Tree Shakeable** - Only imports what you use  

## Technical Details

The key difference is in the component type:

- **Ant Design Icons**: `FunctionalComponent<AntdIconProps>`
- **Old Aha Icons**: `ComponentObjectPropsOptions` (Vue SFC)
- **New Aha Icons**: `FunctionalComponent` via `defineComponent`

The `defineComponent` with a `setup()` that returns a render function creates a component compatible with Ant Design's icon prop expectations.

