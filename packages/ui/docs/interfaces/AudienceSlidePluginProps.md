[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / AudienceSlidePluginProps

# Interface: AudienceSlidePluginProps

Defined in: [packages/ui/src/zoid.ts:105](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/ed9f8db8759a780455b9f361423c35035a6f7ed1/packages/ui/src/zoid.ts#L105)

Interface for the properties expected by the AudienceSlidePluginIframe component.

## Properties

### baseUrl?

> `optional` **baseUrl**: `string`

Defined in: [packages/ui/src/zoid.ts:128](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/ed9f8db8759a780455b9f361423c35035a6f7ed1/packages/ui/src/zoid.ts#L128)

The base URL of the parent application

***

### onHeightChange()?

> `optional` **onHeightChange**: (`height`) => `void`

Defined in: [packages/ui/src/zoid.ts:122](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/ed9f8db8759a780455b9f361423c35035a6f7ed1/packages/ui/src/zoid.ts#L122)

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

> `optional` **presentation**: `Record`\<`string`, `any`\>

Defined in: [packages/ui/src/zoid.ts:111](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/ed9f8db8759a780455b9f361423c35035a6f7ed1/packages/ui/src/zoid.ts#L111)

Presentation-wide settings and data that affect the plugin's appearance and behavior.

***

### slide?

> `optional` **slide**: `Record`\<`string`, `any`\>

Defined in: [packages/ui/src/zoid.ts:115](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/ed9f8db8759a780455b9f361423c35035a6f7ed1/packages/ui/src/zoid.ts#L115)

Data specific to the currently active slide.

***

### slideAttributes?

> `optional` **slideAttributes**: `Record`\<`string`, `any`\>

Defined in: [packages/ui/src/zoid.ts:126](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/ed9f8db8759a780455b9f361423c35035a6f7ed1/packages/ui/src/zoid.ts#L126)

Custom attributes associated with the current slide.

***

### url

> **url**: `string`

Defined in: [packages/ui/src/zoid.ts:107](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/ed9f8db8759a780455b9f361423c35035a6f7ed1/packages/ui/src/zoid.ts#L107)

The URL of the plugin to be loaded in the iframe
