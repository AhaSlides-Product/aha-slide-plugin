[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / usePresenterPlugin

# Function: usePresenterPlugin()

> **usePresenterPlugin**(`options`): `object`

Defined in: [packages/ui/src/zoid.ts:191](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/cd9b05f8dbb05e4870c0cb2cf0990c50f3d011fa/packages/ui/src/zoid.ts#L191)

Hook for Presenter Plugins (Canvas, Settings).
Provides access to presentation and slide data, as well as actions to manage slide attributes.

## Parameters

### options

[`UseSlidePluginOptions`](../interfaces/UseSlidePluginOptions.md) = `...`

Configure hook behavior (e.g., disable auto-height).

## Returns

`object`

Reactive refs for presentation and slide props, and actions for slide attributes.

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
