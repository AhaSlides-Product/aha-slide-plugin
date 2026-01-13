[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / AudienceSlidePluginProps

# Interface: AudienceSlidePluginProps

Defined in: [packages/ui/src/zoid.ts:99](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/cd9b05f8dbb05e4870c0cb2cf0990c50f3d011fa/packages/ui/src/zoid.ts#L99)

Interface for the properties expected by the AudienceSlidePluginIframe component.

## Properties

### onHeightChange()?

> `optional` **onHeightChange**: (`height`) => `void`

Defined in: [packages/ui/src/zoid.ts:116](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/cd9b05f8dbb05e4870c0cb2cf0990c50f3d011fa/packages/ui/src/zoid.ts#L116)

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

Defined in: [packages/ui/src/zoid.ts:105](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/cd9b05f8dbb05e4870c0cb2cf0990c50f3d011fa/packages/ui/src/zoid.ts#L105)

Presentation-wide settings and data that affect the plugin's appearance and behavior.

***

### slide?

> `optional` **slide**: `Record`\<`string`, `any`\>

Defined in: [packages/ui/src/zoid.ts:109](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/cd9b05f8dbb05e4870c0cb2cf0990c50f3d011fa/packages/ui/src/zoid.ts#L109)

Data specific to the currently active slide.

***

### url

> **url**: `string`

Defined in: [packages/ui/src/zoid.ts:101](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/cd9b05f8dbb05e4870c0cb2cf0990c50f3d011fa/packages/ui/src/zoid.ts#L101)

The URL of the plugin to be loaded in the iframe
