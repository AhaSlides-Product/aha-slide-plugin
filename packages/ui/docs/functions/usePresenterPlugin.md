[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / usePresenterPlugin

# Function: usePresenterPlugin()

> **usePresenterPlugin**(`options`): `object`

Defined in: [packages/ui/src/zoid.ts:203](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d0b17028ef558ec827f47f763e73d18be6e2a14e/packages/ui/src/zoid.ts#L203)

Hook for Presenter Plugins (Canvas, Settings).
Provides access to presentation and slide data, as well as actions to manage slide attributes.

## Parameters

### options

[`UseSlidePluginOptions`](../interfaces/UseSlidePluginOptions.md) = `...`

Configure hook behavior (e.g., disable auto-height).

## Returns

`object`

Reactive refs for presentation and slide props, and actions for slide attributes.

### baseUrl

> **baseUrl**: `Ref`\<`string` \| `undefined`, `string` \| `undefined`\>

### getSlideAttributesAction()

> **getSlideAttributesAction**: () => `Promise`\<`any`\>

#### Returns

`Promise`\<`any`\>

### presentationProps

> **presentationProps**: `Ref`\<`Record`\<`string`, `any`\> \| `undefined`, `Record`\<`string`, `any`\> \| `undefined`\>

### slideProps

> **slideProps**: `Ref`\<`Record`\<`string`, `any`\> \| `undefined`, `Record`\<`string`, `any`\> \| `undefined`\>

### upsertSlideAttributeAction

> **upsertSlideAttributeAction**: `any`
