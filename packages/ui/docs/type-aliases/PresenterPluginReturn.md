[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / PresenterPluginReturn

# Type Alias: PresenterPluginReturn

> **PresenterPluginReturn** = [`BaseSlidePluginReturn`](../interfaces/BaseSlidePluginReturn.md) & `object`

Defined in: [packages/ui/src/zoid/presenter.ts:220](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/presenter.ts#L220)

## Type Declaration

### accessToken

> **accessToken**: `string` \| `undefined`

Access token for the current user.

### closePluginModal

> **closePluginModal**: () => `void` \| `undefined`

Close the currently open plugin modal.

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

### openPluginModal

> **openPluginModal**: (`path?`) => `void` \| `undefined`

Open a full-screen modal with a custom path.

#### Param

The custom path for the modal iframe.

### openUploadImageModal

> **openUploadImageModal**: () => `Promise`\<[`ImageUploadResult`](../interfaces/ImageUploadResult.md)\> \| `undefined`

### setSubmissionCount

> **setSubmissionCount**: (`payload`) => `void` \| `undefined`

### showConfirmModal

> **showConfirmModal**: (`payload`) => `Promise`\<`boolean`\> \| `undefined`

Show a confirm modal in the parent app.

#### Param

The confirm modal data.

#### Returns

A promise resolving to a boolean indicating whether the user confirmed.

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
