[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / useAudiencePlugin

# Function: useAudiencePlugin()

> **useAudiencePlugin**(`options`): `object`

Defined in: [packages/ui/src/zoid.ts:250](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/cd9b05f8dbb05e4870c0cb2cf0990c50f3d011fa/packages/ui/src/zoid.ts#L250)

Hook for Audience Plugins.
Provides access to presentation, slide, and slideAttributes data.

## Parameters

### options

[`UseSlidePluginOptions`](../interfaces/UseSlidePluginOptions.md) = `...`

Configure hook behavior (e.g., disable auto-height).

## Returns

`object`

Reactive refs for presentation, slide, and slideAttributes props.

### presentationProps

> **presentationProps**: `Ref`\<`Record`\<`string`, `any`\> \| `undefined`, `Record`\<`string`, `any`\> \| `undefined`\>

### slideProps

> **slideProps**: `Ref`\<`Record`\<`string`, `any`\> \| `undefined`, `Record`\<`string`, `any`\> \| `undefined`\>
