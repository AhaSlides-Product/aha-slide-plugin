# Aha Icons

Custom icon system that extends Ant Design Vue's icon system.

## How it works

1. **SVG Source Files**: All icons are stored as SVG files in this directory with the `aha-` prefix
2. **Vue Component Generation**: Run `npm run generate:icons` to generate Vue components from SVG files
3. **Import & Use**: Import and use like Ant Design icons

## Usage

### Generate Icon Components

After adding or modifying SVG files, run:

```bash
npm run generate:icons
```

This will:
- Rename any `system-*.svg` files to `aha-*.svg`
- Generate Vue components in `src/generated-icons/`
- Create an index file for easy imports

### Import Icons

```vue
<script setup>
import { AhaStarFilled, AhaHeartStraight } from '@aha/ui/icons';
</script>

<template>
  <AhaStarFilled style="font-size: 24px; color: purple;" />
  <AhaHeartStraight style="font-size: 24px; color: red;" />
</template>
```

### Features

- ✅ Works exactly like Ant Design icons
- ✅ Icons inherit `currentColor` from CSS
- ✅ Sized with CSS `font-size`
- ✅ Full TypeScript support
- ✅ Tree-shakeable (only imports what you use)

## Adding New Icons

1. Add your SVG file to this directory with `aha-` prefix
   - Example: `aha-my-icon.svg`
   
2. Run the generator:
   ```bash
   npm run generate:icons
   ```

3. Import and use:
   ```vue
   import { AhaMyIcon } from '@aha/ui/icons';
   ```

## Icon Naming Convention

- **File**: `aha-icon-name.svg` (kebab-case with aha- prefix)
- **Component**: `AhaIconName` (PascalCase)
- **Import**: `import { AhaIconName } from '@aha/ui/icons'`

