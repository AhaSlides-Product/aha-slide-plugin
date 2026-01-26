# Aha Icons Documentation

Aha Icons extend Ant Design Vue's icon system with custom icons.

## Quick Start

### 1. Generate Icons

First, generate Vue components from SVG files:

```bash
cd packages/ui
npm run generate:icons
```

### 2. Import and Use

```vue
<script setup>
import { AhaStarFilled, AhaHeartStraight, AhaBellFilled } from '@aha/ui/icons';
</script>

<template>
  <!-- Use like Ant Design icons -->
  <AhaStarFilled style="font-size: 24px; color: gold;" />
  <AhaHeartStraight style="font-size: 32px; color: red;" />
  <AhaBellFilled style="font-size: 20px;" />
</template>
```

## Styling

Icons inherit `currentColor` and are sized with CSS:

```vue
<template>
  <!-- Size with font-size -->
  <AhaStarFilled style="font-size: 16px;" />
  <AhaStarFilled style="font-size: 24px;" />
  <AhaStarFilled style="font-size: 32px;" />
  
  <!-- Color with color property -->
  <AhaStarFilled style="color: purple;" />
  
  <!-- Or use Tailwind classes -->
  <AhaStarFilled class="text-2xl text-purple-600" />
</template>
```

## Comparison with V1

### Old Way (V1 - unplugin-icons)
```vue
<script setup>
import IconSystemStar from '~icons/aha/system-star';
</script>

<template>
  <IconSystemStar />
</template>
```

**Issues:**
- ❌ Import statement required
- ❌ Component name doesn't match file name
- ❌ Different from Ant Design pattern

### New Way (V2 - Generated Components)
```vue
<script setup>
import { AhaStar } from '@aha/ui/icons';
</script>

<template>
  <AhaStar />
</template>
```

**Benefits:**
- ✅ Clean import from single package
- ✅ Consistent with Ant Design icons
- ✅ Tree-shakeable
- ✅ TypeScript support
- ✅ Name matches file name

## Icon List

After running `npm run generate:icons`, you can see all available icons in:
- `packages/ui/src/generated-icons/index.ts`
- `packages/ui/src/generated-icons/icon-names.ts`

## Adding Custom Icons

1. Add SVG file to `packages/ui/src/icons/`
   - Name it with `aha-` prefix: `aha-my-custom-icon.svg`

2. Run generator:
   ```bash
   npm run generate:icons
   ```

3. Use it:
   ```vue
   <script setup>
   import { AhaMyCustomIcon } from '@aha/ui/icons';
   </script>
   
   <template>
     <AhaMyCustomIcon style="font-size: 24px;" />
   </template>
   ```

## Migration Guide

### From V1 to V2

1. Run the generator:
   ```bash
   npm run generate:icons
   ```

2. Update imports:
   ```diff
   - import IconSystemStar from '~icons/aha/system-star';
   + import { AhaStar } from '@aha/ui/icons';
   ```

3. Update usage (no changes needed in template):
   ```vue
   <template>
     <!-- Works the same! -->
     <AhaStar />
   </template>
   ```

## TypeScript Support

Get autocomplete and type safety:

```typescript
import type { IconName } from '@aha/ui/icons/icon-names';

const iconName: IconName = 'aha-star'; // ✅ Type-safe
const invalid: IconName = 'not-exist'; // ❌ TypeScript error
```

