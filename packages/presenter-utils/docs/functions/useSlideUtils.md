[**@aha/presenter-utils**](../README.md)

***

[@aha/presenter-utils](../README.md) / useSlideUtils

# Function: useSlideUtils()

> **useSlideUtils**(): `object`

Defined in: [index.ts:10](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/39439237c366309fa5f1d8b1c51b57a305f27d27/packages/presenter-utils/src/index.ts#L10)

A composable that provides utilities for interacting with slide data.
Automatically extracts the `slideId` from the current route parameters.

## Returns

An object containing `updateSlide`, `getSlideData`, and the `slideId`.

### getSlideData()

> **getSlideData**: (`fields`) => `Promise`\<`any`\>

3. getSlideData function
Fetches slide data from the backend/store

#### Parameters

##### fields

`string`[]

#### Returns

`Promise`\<`any`\>

### slideId

> **slideId**: `string` \| `string`[]

### updateSlide()

> **updateSlide**: (`updatedData`) => `Promise`\<`any`\>

2. updateSlide function
Handles the logic for sending updates to the backend/store

#### Parameters

##### updatedData

The new slide content

###### attributeKey

`string`

###### attributeValue

`any`

#### Returns

`Promise`\<`any`\>
