[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / useSlidePlugin

# Function: useSlidePlugin()

> **useSlidePlugin**(`options`): `object`

Defined in: [packages/ui/src/zoid.ts:144](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/39439237c366309fa5f1d8b1c51b57a305f27d27/packages/ui/src/zoid.ts#L144)

Vue composition hook for slide plugin components.

Features:
1. **Prop Management**: Provides reactive access to `presentationProps` and `slideActiveProps`.
2. **Prop Diffing**: Automatically logs changes to specific keys when the parent updates props.
3. **Height Reporting**: Handles automatic height reporting via [autoReportHeight](autoReportHeight.md).

## Parameters

### options

[`UseSlidePluginOptions`](../interfaces/UseSlidePluginOptions.md) = `...`

Configure hook behavior (e.g., disable auto-height).

## Returns

`object`

Reactive refs for presentation and slide props.

### presentationProps

> **presentationProps**: `Ref`\<\{\[`key`: `string`\]: `any`; `filteringProfanity?`: `boolean`; `fontFamily?`: `string`; `language?`: `string`; `showHyperLink?`: `boolean`; \} \| `undefined`, \{\[`key`: `string`\]: `any`; `filteringProfanity?`: `boolean`; `fontFamily?`: `string`; `language?`: `string`; `showHyperLink?`: `boolean`; \} \| \{\[`key`: `string`\]: `any`; `filteringProfanity?`: `boolean`; `fontFamily?`: `string`; `language?`: `string`; `showHyperLink?`: `boolean`; \} \| `undefined`\>

### slideActiveProps

> **slideActiveProps**: `Ref`\<\{\[`key`: `string`\]: `any`; `hideResult?`: `boolean`; `id?`: `string` \| `number`; `stopSubmission?`: `boolean`; `textColour?`: `string`; \} \| `undefined`, \{\[`key`: `string`\]: `any`; `hideResult?`: `boolean`; `id?`: `string` \| `number`; `stopSubmission?`: `boolean`; `textColour?`: `string`; \} \| \{\[`key`: `string`\]: `any`; `hideResult?`: `boolean`; `id?`: `string` \| `number`; `stopSubmission?`: `boolean`; `textColour?`: `string`; \} \| `undefined`\>

## Example

```typescript
// Standard auto-height usage
const { presentationProps } = useSlidePlugin();

// Fixed 100% height usage
const { slideActiveProps } = useSlidePlugin({ autoHeight: false });
```
