[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / useBaseSlidePlugin

# Function: useBaseSlidePlugin()

> **useBaseSlidePlugin**(`options`, `onPropsExtension?`): `object`

Defined in: [packages/ui/src/zoid/base.ts:230](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/68e242b1a3734c506525f815fb958e13c2f7e87c/packages/ui/src/zoid/base.ts#L230)

Base hook that provides common functionality for both presenter and audience plugins.

## Parameters

### options

[`UseSlidePluginOptions`](../interfaces/UseSlidePluginOptions.md) = `...`

Configure hook behavior (e.g., disable auto-height).

### onPropsExtension?

(`newProps`) => `void`

Optional callback to handle additional props updates.

## Returns

`object`

Reactive refs for common presentation and slide props, and shared actions.

### audienceSendCountingUniqueAction

> **audienceSendCountingUniqueAction**: `any`

### baseUrl

> **baseUrl**: `Ref`\<`string` \| `undefined`, `string` \| `undefined`\>

### presentationColorPaletteProps

> **presentationColorPaletteProps**: `Ref`\<`string`[] \| `undefined`, `string`[] \| `undefined`\>

### presentationLighterColorPaletteProps

> **presentationLighterColorPaletteProps**: `Ref`\<`string`[] \| `undefined`, `string`[] \| `undefined`\>

### presentationProps

> **presentationProps**: `Ref`\<`Record`\<`string`, `any`\> \| `undefined`, `Record`\<`string`, `any`\> \| `undefined`\>

### slideProps

> **slideProps**: `Ref`\<`Record`\<`string`, `any`\> \| `undefined`, `Record`\<`string`, `any`\> \| `undefined`\>

### subscribeTopic

> **subscribeTopic**: `any`

### unsubscribeTopic

> **unsubscribeTopic**: `any`

### xprops

> **xprops**: `any`
