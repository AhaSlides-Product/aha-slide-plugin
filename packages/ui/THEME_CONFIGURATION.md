# Theme Configuration Guide

This guide explains how Ant Design Vue is configured to use the Tailwind CSS color palette from `@aha/ui/tailwind.config.js`.

## Overview

The `@aha/ui` package provides a unified theme configuration that bridges **Ant Design Vue** and **Tailwind CSS**, ensuring design consistency across all applications.

## How It Works

### 1. Tailwind Config as Source of Truth

The color palette is defined in [`tailwind.config.js`](./tailwind.config.js) and includes:

- **Brand colors**: `brand`, `primary`, `secondary`
- **Base colors**: `base`, `gray`, `white`, `black`
- **Semantic colors**: `red`, `green`, `yellow`, `blue`
- **Extended palette**: `purple`, `emerald`, `coral`, `pink`, `indigo`

### 2. Ant Design Vue Theme Mapping

The [`theme.ts`](./src/theme.ts) file imports the Tailwind config and maps colors to Ant Design Vue's design tokens:

```typescript
import tailwindConfig from '../tailwind.config.js';

const colors = tailwindConfig.theme.colors;

export const theme: ThemeConfig = {
  token: {
    colorPrimary: colors.purple[60],         // #6A1EBB
    colorSuccess: colors.emerald[60],        // #16C49A
    colorWarning: colors.coral[60],          // #FF7747
    colorError: colors.red[100],             // #DA323C
    // ... more mappings
  }
};
```

### 3. Global Registration

In your application's `main.ts`, the theme is applied globally:

```typescript
import { createApp } from 'vue';
import Antd from 'ant-design-vue';
import { theme } from '@aha/ui';
import App from './App.vue';

const app = createApp(App);
app.use(Antd);
app.mount('#app');
```

In `App.vue`, wrap your app with `<a-config-provider>`:

```vue
<template>
  <a-config-provider :theme="theme">
    <router-view />
  </a-config-provider>
</template>

<script setup lang="ts">
import { theme } from '@aha/ui';
</script>
```

## Using Colors in Your Components

### Option 1: Use Ant Design Vue Components

Components automatically inherit the theme:

```vue
<template>
  <!-- Button uses colorPrimary from theme -->
  <a-button type="primary">Primary Button</a-button>
  
  <!-- Alert uses colorSuccess from theme -->
  <a-alert type="success" message="Success!" />
</template>
```

### Option 2: Import Tailwind Colors Directly

For custom styling, import the color palette:

```vue
<script setup lang="ts">
import { tailwindColors } from '@aha/ui';

const styles = {
  backgroundColor: tailwindColors.purple[60],  // #6A1EBB
  color: tailwindColors.base[0],               // #FFFFFF
  border: `1px solid ${tailwindColors.base[40]}` // #CECECE
};
</script>

<template>
  <div :style="styles">Custom styled element</div>
</template>
```

### Option 3: Use Tailwind CSS Classes

If your project has Tailwind CSS configured:

```vue
<template>
  <div class="bg-purple-60 text-base-0 border border-base-40">
    Styled with Tailwind classes
  </div>
</template>
```

## Available Color Tokens

### Ant Design Vue Theme Tokens

The following tokens are mapped from Tailwind colors:

| Token | Tailwind Source | Hex Value | Usage |
|-------|----------------|-----------|-------|
| `colorPrimary` | `purple[60]` | `#6A1EBB` | Primary brand color |
| `colorPrimaryHover` | `purple[50]` | `#8644D4` | Hover state |
| `colorPrimaryActive` | `purple[70]` | `#621BAF` | Active state |
| `colorSuccess` | `emerald[60]` | `#16C49A` | Success messages |
| `colorWarning` | `coral[60]` | `#FF7747` | Warning messages |
| `colorError` | `red[100]` | `#DA323C` | Error messages |
| `colorInfo` | `primary[80]` | `#D3B4FF` | Info messages |
| `colorBorder` | `base[40]` | `#CECECE` | Default borders |
| `colorText` | `base[100]` | `#0A0A0A` | Primary text |
| `colorTextSecondary` | `base[80]` | `#707070` | Secondary text |

### Component-Specific Tokens

#### Button Component

```typescript
components: {
  Button: {
    colorPrimary: colors.purple[60],       // #6A1EBB
    colorPrimaryHover: colors.purple[50],  // #8644D4
    colorPrimaryActive: colors.purple[70], // #621BAF
  }
}
```

## Customizing the Theme

### Modifying Tailwind Colors

To change colors across all applications, edit `packages/ui/tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    colors: {
      purple: {
        60: '#6A1EBB', // Change this to update colorPrimary
        // ...
      }
    }
  }
}
```

### Adding New Component Tokens

To customize additional Ant Design components, edit `packages/ui/src/theme.ts`:

```typescript
export const theme: ThemeConfig = {
  token: { /* ... */ },
  components: {
    Button: { /* ... */ },
    // Add new component customizations
    Card: {
      colorBorderSecondary: colors.base[30],
    },
    Input: {
      colorBorder: colors.secondary[20],
    }
  }
};
```

### Per-App Theme Overrides

If a specific app needs theme overrides, extend the base theme:

```typescript
import { theme as baseTheme } from '@aha/ui';
import type { ThemeConfig } from 'ant-design-vue/es/config-provider/context';

const customTheme: ThemeConfig = {
  ...baseTheme,
  token: {
    ...baseTheme.token,
    colorPrimary: '#custom-color', // Override for this app only
  }
};
```

## Building the Package

After making changes to `theme.ts` or `tailwind.config.js`:

```bash
cd packages/ui
npm run build
```

This will:
1. Compile TypeScript files (including theme.ts)
2. Process and build the CSS with Tailwind

## TypeScript Configuration

The `tsconfig.json` is configured to handle JavaScript imports:

```json
{
  "compilerOptions": {
    "allowJs": true,
    "resolveJsonModule": true
  }
}
```

A type declaration file `tailwind.config.d.ts` provides TypeScript support for the Tailwind config import.

## Troubleshooting

### Build Errors

**Issue**: "Cannot write file 'tailwind.config.js'"
- **Solution**: Ensure `tailwind.config.js` is excluded in `tsconfig.json`

**Issue**: Component token property errors
- **Solution**: Check Ant Design Vue documentation for valid token names per component

### Runtime Errors

**Issue**: Colors showing as `undefined`
- **Solution**: Verify the Tailwind config exports are correct
- **Solution**: Check that the UI package is built (`npm run build`)

### Theme Not Applying

**Issue**: Components not using theme colors
- **Solution**: Ensure `<a-config-provider :theme="theme">` wraps your app
- **Solution**: Verify theme is imported from `@aha/ui`

## Resources

- [Ant Design Vue Theme Customization](https://antdv.com/docs/vue/customize-theme)
- [Ant Design Vue ConfigProvider](https://antdv.com/components/config-provider)
- [Tailwind CSS Configuration](https://tailwindcss.com/docs/configuration)

