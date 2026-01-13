[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / useAudiencePlugin

# Function: useAudiencePlugin()

> **useAudiencePlugin**(`options`): `object`

Defined in: [packages/ui/src/zoid.ts:273](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/ed9f8db8759a780455b9f361423c35035a6f7ed1/packages/ui/src/zoid.ts#L273)

Hook for Audience Plugins.
Provides access to presentation, slide, and slideAttributes data.

## Parameters

### options

[`UseSlidePluginOptions`](../interfaces/UseSlidePluginOptions.md) = `...`

Configure hook behavior (e.g., disable auto-height).

## Returns

`object`

Reactive refs for presentation, slide, and slideAttributes props.

### baseUrl

> **baseUrl**: `Ref`\<`string` \| `undefined`, `string` \| `undefined`\>

### presentationProps

> **presentationProps**: `Ref`\<`Record`\<`string`, `any`\> \| `undefined`, `Record`\<`string`, `any`\> \| `undefined`\>

### slideAttributesProps

> **slideAttributesProps**: `Ref`\<`Record`\<`string`, `any`\> \| `undefined`, `Record`\<`string`, `any`\> \| `undefined`\>

### slideProps

> **slideProps**: `Ref`\<`Record`\<`string`, `any`\> \| `undefined`, `Record`\<`string`, `any`\> \| `undefined`\>
