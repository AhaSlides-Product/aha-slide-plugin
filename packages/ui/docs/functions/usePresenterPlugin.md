[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / usePresenterPlugin

# Function: usePresenterPlugin()

> **usePresenterPlugin**(`options`): `object`

Defined in: [packages/ui/src/zoid.ts:458](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/3f307ee201e0da6c14fae0bf8233f474547111f3/packages/ui/src/zoid.ts#L458)

Hook for Presenter Plugins (Canvas, Settings).
Provides access to presentation and slide data, as well as actions to manage slide attributes.

## Parameters

### options

[`UseSlidePluginOptions`](../interfaces/UseSlidePluginOptions.md) = `...`

Configure hook behavior (e.g., disable auto-height).

## Returns

`object`

Reactive refs for presentation and slide props, and actions for slide attributes.

### audienceSendCountingUniqueAction

> **audienceSendCountingUniqueAction**: (`payload?`) => `Promise`\<`any`\> \| `undefined`

### baseUrl

> **baseUrl**: `Ref`\<`string` \| `undefined`\>

### getSlideAttributesAction()

> **getSlideAttributesAction**: (`slideId?`) => `Promise`\<`any`\>

#### Parameters

##### slideId?

`string` | `number`

#### Returns

`Promise`\<`any`\>

### presentationProps

> **presentationProps**: `Ref`\<`Record`\<`string`, `any`\> \| `undefined`\>

### slideProps

> **slideProps**: `Ref`\<`Record`\<`string`, `any`\> \| `undefined`\>

### subscribeTopic

> **subscribeTopic**: (`options`) => `void` \| `undefined`

### unsubscribeTopic

> **unsubscribeTopic**: (`topic`) => `void` \| `undefined`

### uploadImage

> **uploadImage**: () => `Promise`\<[`ImageUploadResult`](../interfaces/ImageUploadResult.md)\> \| `undefined`

### upsertSlideAttributeAction

> **upsertSlideAttributeAction**: (`payload`) => `Promise`\<`any`\> \| `undefined`
