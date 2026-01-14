[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / tailwindColors

# Variable: tailwindColors

> `const` **tailwindColors**: `object` = `tailwindConfig.theme.colors`

Defined in: [packages/ui/src/tailwind-colors.ts:15](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/ba80983bd50ca063a1b9a1379ae08370d8394222/packages/ui/src/tailwind-colors.ts#L15)

Tailwind color palette from the shared UI configuration.
Use these colors to maintain design consistency across the application.

## Type Declaration

### base

> **base**: `Record`\<`string`, `string`\>

### black

> **black**: `Record`\<`string`, `string`\>

### blue

> **blue**: `Record`\<`string`, `string`\>

### brand

> **brand**: `Record`\<`string`, `string`\>

### button

> **button**: `Record`\<`string`, `string`\>

### coral

> **coral**: `Record`\<`string`, `string`\>

### current

> **current**: `string`

### emerald

> **emerald**: `Record`\<`string`, `string`\>

### gray

> **gray**: `Record`\<`string`, `string`\>

### green

> **green**: `Record`\<`string`, `string`\>

### indigo

> **indigo**: `Record`\<`string`, `string`\>

### pink

> **pink**: `Record`\<`string`, `string`\>

### primary

> **primary**: `Record`\<`string`, `string`\>

### purple

> **purple**: `Record`\<`string`, `string`\>

### red

> **red**: `Record`\<`string`, `string`\>

### secondary

> **secondary**: `Record`\<`string`, `string`\>

### transparent

> **transparent**: `string`

### white

> **white**: `Record`\<`string`, `string`\>

### yellow

> **yellow**: `Record`\<`string`, `string`\>

## Example

```typescript
import { tailwindColors } from '@aha/ui';

const primaryColor = tailwindColors.purple[60]; // #6A1EBB
const successColor = tailwindColors.emerald[60]; // #16C49A
```
