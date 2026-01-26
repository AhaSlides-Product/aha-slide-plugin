[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / AudienceSlidePluginProps

# Interface: AudienceSlidePluginProps

Defined in: [packages/ui/src/zoid.ts:193](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/3f307ee201e0da6c14fae0bf8233f474547111f3/packages/ui/src/zoid.ts#L193)

Interface for the properties expected by the AudienceSlidePluginIframe component.

## Properties

### audienceEmail?

> `optional` **audienceEmail**: `string`

Defined in: [packages/ui/src/zoid.ts:271](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/3f307ee201e0da6c14fae0bf8233f474547111f3/packages/ui/src/zoid.ts#L271)

The email of the audience participant

***

### audienceEmoji?

> `optional` **audienceEmoji**: `string`

Defined in: [packages/ui/src/zoid.ts:267](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/3f307ee201e0da6c14fae0bf8233f474547111f3/packages/ui/src/zoid.ts#L267)

The emoji chosen by the audience participant

***

### audienceId?

> `optional` **audienceId**: `string` \| `number`

Defined in: [packages/ui/src/zoid.ts:269](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/3f307ee201e0da6c14fae0bf8233f474547111f3/packages/ui/src/zoid.ts#L269)

The unique identifier of the audience participant

***

### audienceName?

> `optional` **audienceName**: `string`

Defined in: [packages/ui/src/zoid.ts:265](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/3f307ee201e0da6c14fae0bf8233f474547111f3/packages/ui/src/zoid.ts#L265)

The name of the audience participant

***

### audienceSendCountingUniqueAction()?

> `optional` **audienceSendCountingUniqueAction**: (`payload?`) => `Promise`\<`any`\>

Defined in: [packages/ui/src/zoid.ts:305](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/3f307ee201e0da6c14fae0bf8233f474547111f3/packages/ui/src/zoid.ts#L305)

Action to send counting data from the audience to the parent application.

#### Parameters

##### payload?

`any`

Optional payload for counting.

#### Returns

`Promise`\<`any`\>

A promise resolving when the counting is handled.

***

### audienceTeam?

> `optional` **audienceTeam**: `string`

Defined in: [packages/ui/src/zoid.ts:273](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/3f307ee201e0da6c14fae0bf8233f474547111f3/packages/ui/src/zoid.ts#L273)

The team name of the audience participant

***

### baseUrl?

> `optional` **baseUrl**: `string`

Defined in: [packages/ui/src/zoid.ts:286](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/3f307ee201e0da6c14fae0bf8233f474547111f3/packages/ui/src/zoid.ts#L286)

The base URL of the parent application

***

### onHeightChange()?

> `optional` **onHeightChange**: (`height`) => `void`

Defined in: [packages/ui/src/zoid.ts:280](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/3f307ee201e0da6c14fae0bf8233f474547111f3/packages/ui/src/zoid.ts#L280)

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

Defined in: [packages/ui/src/zoid.ts:199](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/3f307ee201e0da6c14fae0bf8233f474547111f3/packages/ui/src/zoid.ts#L199)

Presentation-wide settings and data that affect the plugin's appearance and behavior.

#### Index Signature

\[`key`: `string`\]: `any`

#### accessCode?

> `optional` **accessCode**: `string`

The access code of the presentation

#### audienceAdmission?

> `optional` **audienceAdmission**: `string`

The audience admission setting (e.g., 'auto', 'manual')

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

#### presenting?

> `optional` **presenting**: `boolean`

Whether the presentation is currently presenting

#### shareCode?

> `optional` **shareCode**: `string`

The share code of the presentation

#### showHyperLink?

> `optional` **showHyperLink**: `boolean`

Whether to show hyperlinks in the content

#### teamPlay?

> `optional` **teamPlay**: `Record`\<`string`, `any`\>

The teamplay object used in the presentation

#### uniqueAccessCode?

> `optional` **uniqueAccessCode**: `string`

The unique access code of the presentation

***

### slide?

> `optional` **slide**: `object`

Defined in: [packages/ui/src/zoid.ts:229](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/3f307ee201e0da6c14fae0bf8233f474547111f3/packages/ui/src/zoid.ts#L229)

Data specific to the currently active slide.

#### Index Signature

\[`key`: `string`\]: `any`

#### fastAnswerGetMorePoint?

> `optional` **fastAnswerGetMorePoint**: `boolean`

Whether faster answers award more points

#### hasTimeLimit?

> `optional` **hasTimeLimit**: `boolean`

Whether the slide has a time limit

#### id?

> `optional` **id**: `string` \| `number`

The unique identifier of the slide

#### imageSubmission?

> `optional` **imageSubmission**: `boolean`

Whether image submission is allowed

#### isCorrectGetPoint?

> `optional` **isCorrectGetPoint**: `boolean`

Whether answering correctly awards points

#### isEnableStreakBonus?

> `optional` **isEnableStreakBonus**: `boolean`

Whether streak bonus is enabled

#### isEnableStreakDetection?

> `optional` **isEnableStreakDetection**: `boolean`

Whether streak detection is enabled

#### limitChoice?

> `optional` **limitChoice**: `number`

The limit on the number of choices

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

#### showVotingResultsOnAudience?

> `optional` **showVotingResultsOnAudience**: `boolean`

Whether to show voting results on audience devices

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

### slideAttributes?

> `optional` **slideAttributes**: `Record`\<`string`, `any`\>

Defined in: [packages/ui/src/zoid.ts:284](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/3f307ee201e0da6c14fae0bf8233f474547111f3/packages/ui/src/zoid.ts#L284)

Custom attributes associated with the current slide.

***

### subscribeTopic()?

> `optional` **subscribeTopic**: (`options`) => `void`

Defined in: [packages/ui/src/zoid.ts:292](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/3f307ee201e0da6c14fae0bf8233f474547111f3/packages/ui/src/zoid.ts#L292)

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

Defined in: [packages/ui/src/zoid.ts:311](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/3f307ee201e0da6c14fae0bf8233f474547111f3/packages/ui/src/zoid.ts#L311)

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

Defined in: [packages/ui/src/zoid.ts:298](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/3f307ee201e0da6c14fae0bf8233f474547111f3/packages/ui/src/zoid.ts#L298)

Unsubscribe from a specific MQTT topic.

#### Parameters

##### topic

`string`

The topic to unsubscribe from.

#### Returns

`void`

***

### url

> **url**: `string`

Defined in: [packages/ui/src/zoid.ts:195](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/3f307ee201e0da6c14fae0bf8233f474547111f3/packages/ui/src/zoid.ts#L195)

The URL of the plugin to be loaded in the iframe
