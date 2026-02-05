[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / PresenterPluginReturn

# Type Alias: PresenterPluginReturn

> **PresenterPluginReturn** = [`BaseSlidePluginReturn`](../interfaces/BaseSlidePluginReturn.md) & `object`

Defined in: [packages/ui/src/zoid/presenter.ts:172](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/7a5cd0cf313da47e6a844ced4db8487ff81b2936/packages/ui/src/zoid/presenter.ts#L172)

## Type Declaration

### accessToken

> **accessToken**: `string` \| `undefined`

Access token for the current user.

### currentUserProps

> **currentUserProps**: `Ref`\<`Record`\<`string`, `any`\> \| `undefined`\>

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

### showToastError

> **showToastError**: (`text`, `uniqName?`, `action?`, `options?`) => `void` \| `undefined`

### showToastInfo

> **showToastInfo**: (`text`, `uniqName?`, `action?`, `options?`) => `void` \| `undefined`

### showToastSuccess

> **showToastSuccess**: (`text`, `uniqName?`, `action?`, `options?`) => `void` \| `undefined`

### uploadImage

> **uploadImage**: (`file`) => `Promise`\<[`ImageUploadResult`](../interfaces/ImageUploadResult.md)\> \| `undefined`

### upsertSlideAttributeAction

> **upsertSlideAttributeAction**: (`payload`) => `Promise`\<`any`\> \| `undefined`
