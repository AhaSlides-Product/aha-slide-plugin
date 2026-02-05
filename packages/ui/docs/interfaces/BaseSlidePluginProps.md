[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / BaseSlidePluginProps

# Interface: BaseSlidePluginProps

Defined in: [packages/ui/src/zoid/base.ts:6](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/7a5cd0cf313da47e6a844ced4db8487ff81b2936/packages/ui/src/zoid/base.ts#L6)

Common properties shared between presenter and audience slide plugins.

## Extended by

- [`SlidePluginProps`](SlidePluginProps.md)
- [`AudienceSlidePluginProps`](AudienceSlidePluginProps.md)

## Properties

### audienceSendCountingUniqueAction()?

> `optional` **audienceSendCountingUniqueAction**: (`payload?`) => `Promise`\<`any`\>

Defined in: [packages/ui/src/zoid/base.ts:110](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/7a5cd0cf313da47e6a844ced4db8487ff81b2936/packages/ui/src/zoid/base.ts#L110)

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

Defined in: [packages/ui/src/zoid/base.ts:91](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/7a5cd0cf313da47e6a844ced4db8487ff81b2936/packages/ui/src/zoid/base.ts#L91)

The base URL of the parent application

***

### onHeightChange()?

> `optional` **onHeightChange**: (`height`) => `void`

Defined in: [packages/ui/src/zoid/base.ts:89](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/7a5cd0cf313da47e6a844ced4db8487ff81b2936/packages/ui/src/zoid/base.ts#L89)

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

Defined in: [packages/ui/src/zoid/base.ts:12](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/7a5cd0cf313da47e6a844ced4db8487ff81b2936/packages/ui/src/zoid/base.ts#L12)

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

#### uniqueAccessCode?

> `optional` **uniqueAccessCode**: `string`

The unique access code of the presentation

***

### presentationColorPalette?

> `optional` **presentationColorPalette**: `string`[]

Defined in: [packages/ui/src/zoid/base.ts:40](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/7a5cd0cf313da47e6a844ced4db8487ff81b2936/packages/ui/src/zoid/base.ts#L40)

Presentation-wide color palette attributes.

***

### presentationLighterColorPalette?

> `optional` **presentationLighterColorPalette**: `string`[]

Defined in: [packages/ui/src/zoid/base.ts:44](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/7a5cd0cf313da47e6a844ced4db8487ff81b2936/packages/ui/src/zoid/base.ts#L44)

Presentation-wide lighter color palette attributes.

***

### slide?

> `optional` **slide**: `object`

Defined in: [packages/ui/src/zoid/base.ts:48](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/7a5cd0cf313da47e6a844ced4db8487ff81b2936/packages/ui/src/zoid/base.ts#L48)

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

### subscribeTopic()?

> `optional` **subscribeTopic**: (`options`) => `void`

Defined in: [packages/ui/src/zoid/base.ts:97](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/7a5cd0cf313da47e6a844ced4db8487ff81b2936/packages/ui/src/zoid/base.ts#L97)

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

Defined in: [packages/ui/src/zoid/base.ts:116](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/7a5cd0cf313da47e6a844ced4db8487ff81b2936/packages/ui/src/zoid/base.ts#L116)

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

Defined in: [packages/ui/src/zoid/base.ts:103](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/7a5cd0cf313da47e6a844ced4db8487ff81b2936/packages/ui/src/zoid/base.ts#L103)

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

Defined in: [packages/ui/src/zoid/base.ts:8](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/7a5cd0cf313da47e6a844ced4db8487ff81b2936/packages/ui/src/zoid/base.ts#L8)

The URL of the plugin to be loaded in the iframe
