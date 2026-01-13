[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / useAudiencePlugin

# Function: useAudiencePlugin()

> **useAudiencePlugin**(`options`): `object`

Defined in: [packages/ui/src/zoid.ts:265](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d0b17028ef558ec827f47f763e73d18be6e2a14e/packages/ui/src/zoid.ts#L265)

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

### slideProps

> **slideProps**: `Ref`\<`Record`\<`string`, `any`\> \| `undefined`, `Record`\<`string`, `any`\> \| `undefined`\>
