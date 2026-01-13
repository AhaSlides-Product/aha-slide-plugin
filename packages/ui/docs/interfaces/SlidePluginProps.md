[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / SlidePluginProps

# Interface: SlidePluginProps

Defined in: [packages/ui/src/zoid.ts:7](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/ed9f8db8759a780455b9f361423c35035a6f7ed1/packages/ui/src/zoid.ts#L7)

Interface for the properties expected by the PresenterSlidePluginIframe component.

## Properties

### baseUrl?

> `optional` **baseUrl**: `string`

Defined in: [packages/ui/src/zoid.ts:59](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/ed9f8db8759a780455b9f361423c35035a6f7ed1/packages/ui/src/zoid.ts#L59)

The base URL of the parent application

***

### getSlideAttributesAction()?

> `optional` **getSlideAttributesAction**: () => `Promise`\<`any`\>

Defined in: [packages/ui/src/zoid.ts:50](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/ed9f8db8759a780455b9f361423c35035a6f7ed1/packages/ui/src/zoid.ts#L50)

Action to fetch all custom attributes for the current slide from the parent application.

#### Returns

`Promise`\<`any`\>

A promise resolving to an object containing slide attributes.

***

### onHeightChange()?

> `optional` **onHeightChange**: (`height`) => `void`

Defined in: [packages/ui/src/zoid.ts:44](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/ed9f8db8759a780455b9f361423c35035a6f7ed1/packages/ui/src/zoid.ts#L44)

Callback to report height changes from the child to the parent. 
Sending null signals the parent to use 100% height.

#### Parameters

##### height

The new height in pixels, or null for 100% height.

`number` | `null`

#### Returns

`void`

***

### presentation?

> `optional` **presentation**: `object`

Defined in: [packages/ui/src/zoid.ts:13](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/ed9f8db8759a780455b9f361423c35035a6f7ed1/packages/ui/src/zoid.ts#L13)

Presentation-wide settings and data that affect the plugin's appearance and behavior.

#### Index Signature

\[`key`: `string`\]: `any`

#### filteringProfanity?

> `optional` **filteringProfanity**: `boolean`

Whether profanity filtering is enabled

#### fontFamily?

> `optional` **fontFamily**: `string`

The font family name used in the presentation

#### language?

> `optional` **language**: `string`

The language code (e.g., 'en', 'vi')

#### showHyperLink?

> `optional` **showHyperLink**: `boolean`

Whether to show hyperlinks in the content

***

### slide?

> `optional` **slide**: `object`

Defined in: [packages/ui/src/zoid.ts:27](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/ed9f8db8759a780455b9f361423c35035a6f7ed1/packages/ui/src/zoid.ts#L27)

Data specific to the currently active slide.

#### Index Signature

\[`key`: `string`\]: `any`

#### hideResult?

> `optional` **hideResult**: `boolean`

Whether results are hidden from the audience

#### id?

> `optional` **id**: `string` \| `number`

The unique identifier of the slide

#### stopSubmission?

> `optional` **stopSubmission**: `boolean`

Whether submissions are currently locked

#### textColour?

> `optional` **textColour**: `string`

The base text color for content

***

### upsertSlideAttributeAction()?

> `optional` **upsertSlideAttributeAction**: (`payload`) => `Promise`\<`any`\>

Defined in: [packages/ui/src/zoid.ts:57](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/ed9f8db8759a780455b9f361423c35035a6f7ed1/packages/ui/src/zoid.ts#L57)

Action to create or update a specific attribute for the current slide in the parent application.

#### Parameters

##### payload

The attribute data to sync.

###### attributeKey

`string`

###### attributeValue

`any`

#### Returns

`Promise`\<`any`\>

A promise resolving when the update is complete.

***

### url

> **url**: `string`

Defined in: [packages/ui/src/zoid.ts:9](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/ed9f8db8759a780455b9f361423c35035a6f7ed1/packages/ui/src/zoid.ts#L9)

The URL of the plugin to be loaded in the iframe
