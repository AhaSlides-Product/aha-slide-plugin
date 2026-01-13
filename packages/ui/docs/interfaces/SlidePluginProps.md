[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / SlidePluginProps

# Interface: SlidePluginProps

Defined in: [packages/ui/src/zoid.ts:7](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/39439237c366309fa5f1d8b1c51b57a305f27d27/packages/ui/src/zoid.ts#L7)

Interface for the properties expected by the PresenterSlidePluginIframe component.

## Properties

### onHeightChange()?

> `optional` **onHeightChange**: (`height`) => `void`

Defined in: [packages/ui/src/zoid.ts:30](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/39439237c366309fa5f1d8b1c51b57a305f27d27/packages/ui/src/zoid.ts#L30)

Callback to report height changes from the child to the parent. 
Sending null signals the parent to use 100% height (useful for fixed-height or full-screen plugins).

#### Parameters

##### height

`number` | `null`

#### Returns

`void`

***

### presentation?

> `optional` **presentation**: `object`

Defined in: [packages/ui/src/zoid.ts:11](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/39439237c366309fa5f1d8b1c51b57a305f27d27/packages/ui/src/zoid.ts#L11)

Presentation-wide settings and data

#### Index Signature

\[`key`: `string`\]: `any`

#### filteringProfanity?

> `optional` **filteringProfanity**: `boolean`

#### fontFamily?

> `optional` **fontFamily**: `string`

#### language?

> `optional` **language**: `string`

#### showHyperLink?

> `optional` **showHyperLink**: `boolean`

***

### slideActive?

> `optional` **slideActive**: `object`

Defined in: [packages/ui/src/zoid.ts:19](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/39439237c366309fa5f1d8b1c51b57a305f27d27/packages/ui/src/zoid.ts#L19)

Data specific to the currently active slide

#### Index Signature

\[`key`: `string`\]: `any`

#### hideResult?

> `optional` **hideResult**: `boolean`

#### id?

> `optional` **id**: `string` \| `number`

#### stopSubmission?

> `optional` **stopSubmission**: `boolean`

#### textColour?

> `optional` **textColour**: `string`

***

### url

> **url**: `string`

Defined in: [packages/ui/src/zoid.ts:9](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/39439237c366309fa5f1d8b1c51b57a305f27d27/packages/ui/src/zoid.ts#L9)

The URL of the plugin to be loaded in the iframe
