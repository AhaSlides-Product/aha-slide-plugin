[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / SlidePluginProps

# Interface: SlidePluginProps

Defined in: [packages/ui/src/zoid.ts:8](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/bf5daf7f9bcfd4441ec675a1339242de93661955/packages/ui/src/zoid.ts#L8)

Interface for the properties expected by the PresenterSlidePluginIframe component.

## Properties

### audienceSendCountingUniqueAction()?

> `optional` **audienceSendCountingUniqueAction**: (`payload?`) => `Promise`\<`any`\>

Defined in: [packages/ui/src/zoid.ts:108](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/bf5daf7f9bcfd4441ec675a1339242de93661955/packages/ui/src/zoid.ts#L108)

Action to send counting data from the audience to the parent application.

#### Parameters

##### payload?

`any`

Optional payload for counting.

#### Returns

`Promise`\<`any`\>

A promise resolving when the counting is handled.

***

### baseUrl?

> `optional` **baseUrl**: `string`

Defined in: [packages/ui/src/zoid.ts:89](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/bf5daf7f9bcfd4441ec675a1339242de93661955/packages/ui/src/zoid.ts#L89)

The base URL of the parent application

***

### getSlideAttributesAction()?

> `optional` **getSlideAttributesAction**: (`slideId?`) => `Promise`\<`any`\>

Defined in: [packages/ui/src/zoid.ts:80](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/bf5daf7f9bcfd4441ec675a1339242de93661955/packages/ui/src/zoid.ts#L80)

Action to fetch all custom attributes for the current slide from the parent application.

#### Parameters

##### slideId?

Optional override for the slide identifier.

`string` | `number`

#### Returns

`Promise`\<`any`\>

A promise resolving to an object containing slide attributes.

***

### onHeightChange()?

> `optional` **onHeightChange**: (`height`) => `void`

Defined in: [packages/ui/src/zoid.ts:73](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/bf5daf7f9bcfd4441ec675a1339242de93661955/packages/ui/src/zoid.ts#L73)

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

Defined in: [packages/ui/src/zoid.ts:14](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/bf5daf7f9bcfd4441ec675a1339242de93661955/packages/ui/src/zoid.ts#L14)

Presentation-wide settings and data that affect the plugin's appearance and behavior.

#### Index Signature

\[`key`: `string`\]: `any`

#### accessCode?

> `optional` **accessCode**: `string`

The access code of the presentation

#### audiencePacing?

> `optional` **audiencePacing**: `boolean`

Whether audience pacing is enabled

#### filteringProfanity?

> `optional` **filteringProfanity**: `boolean`

Whether profanity filtering is enabled

#### fontFamily?

> `optional` **fontFamily**: `string`

The font family name used in the presentation

#### id?

> `optional` **id**: `string` \| `number`

The unique identifier of the presentation

#### language?

> `optional` **language**: `string`

The language code (e.g., 'en', 'vi')

#### shareCode?

> `optional` **shareCode**: `string`

The share code of the presentation

#### showHyperLink?

> `optional` **showHyperLink**: `boolean`

Whether to show hyperlinks in the content

#### teamplay?

> `optional` **teamplay**: `Record`\<`string`, `any`\>

The teamplay object used in the presentation

#### uniqueAccessCode?

> `optional` **uniqueAccessCode**: `string`

The unique access code of the presentation

***

### slide?

> `optional` **slide**: `object`

Defined in: [packages/ui/src/zoid.ts:40](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/bf5daf7f9bcfd4441ec675a1339242de93661955/packages/ui/src/zoid.ts#L40)

Data specific to the currently active slide.

#### Index Signature

\[`key`: `string`\]: `any`

#### fastAnswerGetMorePoint?

> `optional` **fastAnswerGetMorePoint**: `boolean`

Whether faster answers award more points

#### id?

> `optional` **id**: `string` \| `number`

The unique identifier of the slide

#### isCorrectGetPoint?

> `optional` **isCorrectGetPoint**: `boolean`

Whether answering correctly awards points

#### isEnableStreakBonus?

> `optional` **isEnableStreakBonus**: `boolean`

Whether streak bonus is enabled

#### isEnableStreakDetection?

> `optional` **isEnableStreakDetection**: `boolean`

Whether streak detection is enabled

#### maxPoint?

> `optional` **maxPoint**: `number`

Maximum points awarded

#### minPoint?

> `optional` **minPoint**: `number`

Minimum points awarded

#### multipleChoice?

> `optional` **multipleChoice**: `boolean`

Whether multiple choices can be selected

#### quizTimestamp?

> `optional` **quizTimestamp**: `number`

The timestamp when the quiz starts

#### slideType?

> `optional` **slideType**: `string`

The type of the slide (e.g., 'multiple-choice', 'open-ended')

#### timeToAnswer?

> `optional` **timeToAnswer**: `number`

Time allowed to answer the slide in seconds

#### version?

> `optional` **version**: `number`

The version of the slide

***

### subscribeTopic()?

> `optional` **subscribeTopic**: (`options`) => `void`

Defined in: [packages/ui/src/zoid.ts:95](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/bf5daf7f9bcfd4441ec675a1339242de93661955/packages/ui/src/zoid.ts#L95)

Subscribe to a specific MQTT topic.

#### Parameters

##### options

Subscription options including type, topic, and callback.

###### callback

(`topic`, `message`) => `void`

###### topic

`string`

###### type?

`string`

#### Returns

`void`

***

### trackGA4AndMixpanel()?

> `optional` **trackGA4AndMixpanel**: (`payload`) => `void`

Defined in: [packages/ui/src/zoid.ts:114](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/bf5daf7f9bcfd4441ec675a1339242de93661955/packages/ui/src/zoid.ts#L114)

Action to track events to GA4 and Mixpanel.

#### Parameters

##### payload

`any`

The event payload to track.

#### Returns

`void`

***

### unsubscribeTopic()?

> `optional` **unsubscribeTopic**: (`topic`) => `void`

Defined in: [packages/ui/src/zoid.ts:101](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/bf5daf7f9bcfd4441ec675a1339242de93661955/packages/ui/src/zoid.ts#L101)

Unsubscribe from a specific MQTT topic.

#### Parameters

##### topic

`string`

The topic to unsubscribe from.

#### Returns

`void`

***

### uploadImage()

> **uploadImage**: () => `Promise`\<[`ImageUploadResult`](ImageUploadResult.md)\>

Defined in: [packages/ui/src/zoid.ts:115](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/bf5daf7f9bcfd4441ec675a1339242de93661955/packages/ui/src/zoid.ts#L115)

#### Returns

`Promise`\<[`ImageUploadResult`](ImageUploadResult.md)\>

***

### upsertSlideAttributeAction()?

> `optional` **upsertSlideAttributeAction**: (`payload`) => `Promise`\<`any`\>

Defined in: [packages/ui/src/zoid.ts:87](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/bf5daf7f9bcfd4441ec675a1339242de93661955/packages/ui/src/zoid.ts#L87)

Action to create or update a specific attribute for the current slide in the parent application.

#### Parameters

##### payload

The attribute data to sync.

###### attributeKey

`string`

###### attributeValue

`any`

###### slideId?

`string` \| `number`

#### Returns

`Promise`\<`any`\>

A promise resolving when the update is complete.

***

### url

> **url**: `string`

Defined in: [packages/ui/src/zoid.ts:10](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/bf5daf7f9bcfd4441ec675a1339242de93661955/packages/ui/src/zoid.ts#L10)

The URL of the plugin to be loaded in the iframe
