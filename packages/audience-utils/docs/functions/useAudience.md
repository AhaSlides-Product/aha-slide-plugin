[**@aha/audience-utils**](../README.md)

***

[@aha/audience-utils](../README.md) / useAudience

# Function: useAudience()

> **useAudience**(): `object`

Defined in: [index.ts:10](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/39439237c366309fa5f1d8b1c51b57a305f27d27/packages/audience-utils/src/index.ts#L10)

A composable that provides utilities for audience interactions with slides.
Automatically extracts the `slideId` from the current route parameters.

## Returns

An object containing `submitAnswer`, `getSlideData`, and the `slideId`.

### getSlideData()

> **getSlideData**: (`fields`) => `Promise`\<`any`\>

Fetches data for the current slide.

#### Parameters

##### fields

`string`[]

The list of field names to retrieve.

#### Returns

`Promise`\<`any`\>

A promise that resolves to the requested slide data.

### slideId

> **slideId**: `string` \| `string`[]

The unique identifier of the slide, extracted from the route parameter `:slideId`.

### submitAnswer()

> **submitAnswer**: (`payload`) => `Promise`\<`any`\>

Submits an answer for the current slide.

#### Parameters

##### payload

`any`

The answer data to submit.

#### Returns

`Promise`\<`any`\>

A promise that resolves to the submission result.
