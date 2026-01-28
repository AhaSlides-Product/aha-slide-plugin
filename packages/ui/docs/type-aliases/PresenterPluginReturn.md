[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / PresenterPluginReturn

# Type Alias: PresenterPluginReturn

> **PresenterPluginReturn** = [`BaseSlidePluginReturn`](../interfaces/BaseSlidePluginReturn.md) & `object`

Defined in: [packages/ui/src/zoid/presenter.ts:119](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/5e374373abd8385ebf5d75eb0914a8916e99b31e/packages/ui/src/zoid/presenter.ts#L119)

## Type Declaration

### emitKeyboardEvent

> **emitKeyboardEvent**: (`event`) => `void` \| `undefined`

### getSlideAttributesAction()

> **getSlideAttributesAction**: (`slideId?`) => `Promise`\<`any`\>

#### Parameters

##### slideId?

`string` | `number`

#### Returns

`Promise`\<`any`\>

### getValues

> **getValues**: (`params`) => `Promise`\<`object`[]\> \| `undefined`

Action to fetch values from a specific bucket and optional key from the parent application.

#### Param

The parameters containing bucket and optional key.

#### Returns

A promise resolving to an array of objects containing key, path, and value.

### onKeyboard

> **onKeyboard**: (`callback`) => `void` \| `undefined`

### openEditImageModal

> **openEditImageModal**: (`currentImageUrl`) => `Promise`\<[`ImageUploadResult`](../interfaces/ImageUploadResult.md)\> \| `undefined`

### openUploadImageModal

> **openUploadImageModal**: () => `Promise`\<[`ImageUploadResult`](../interfaces/ImageUploadResult.md)\> \| `undefined`

### uploadImage

> **uploadImage**: (`file`) => `Promise`\<[`ImageUploadResult`](../interfaces/ImageUploadResult.md)\> \| `undefined`

### upsertSlideAttributeAction

> **upsertSlideAttributeAction**: (`payload`) => `Promise`\<`any`\> \| `undefined`
