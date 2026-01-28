[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / AudienceSlidePluginProps

# Interface: AudienceSlidePluginProps

Defined in: [packages/ui/src/zoid/audience.ts:13](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/5e374373abd8385ebf5d75eb0914a8916e99b31e/packages/ui/src/zoid/audience.ts#L13)

Interface for the properties expected by the AudienceSlidePluginIframe component.

## Extends

- [`BaseSlidePluginProps`](BaseSlidePluginProps.md)

## Properties

### audienceEmail?

> `optional` **audienceEmail**: `string`

Defined in: [packages/ui/src/zoid/audience.ts:25](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/5e374373abd8385ebf5d75eb0914a8916e99b31e/packages/ui/src/zoid/audience.ts#L25)

The email of the audience participant

***

### audienceEmoji?

> `optional` **audienceEmoji**: `string`

Defined in: [packages/ui/src/zoid/audience.ts:21](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/5e374373abd8385ebf5d75eb0914a8916e99b31e/packages/ui/src/zoid/audience.ts#L21)

The emoji chosen by the audience participant

***

### audienceId?

> `optional` **audienceId**: `string` \| `number`

Defined in: [packages/ui/src/zoid/audience.ts:23](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/5e374373abd8385ebf5d75eb0914a8916e99b31e/packages/ui/src/zoid/audience.ts#L23)

The unique identifier of the audience participant

***

### audienceName?

> `optional` **audienceName**: `string`

Defined in: [packages/ui/src/zoid/audience.ts:19](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/5e374373abd8385ebf5d75eb0914a8916e99b31e/packages/ui/src/zoid/audience.ts#L19)

The name of the audience participant

***

### audienceSendCountingUniqueAction()?

> `optional` **audienceSendCountingUniqueAction**: (`payload?`) => `Promise`\<`any`\>

Defined in: [packages/ui/src/zoid/base.ts:110](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/5e374373abd8385ebf5d75eb0914a8916e99b31e/packages/ui/src/zoid/base.ts#L110)

Action to send counting data from the audience to the parent application.

#### Parameters

##### payload?

`any`

Optional payload for counting.

#### Returns

`Promise`\<`any`\>

A promise resolving when the counting is handled.

#### Inherited from

[`BaseSlidePluginProps`](BaseSlidePluginProps.md).[`audienceSendCountingUniqueAction`](BaseSlidePluginProps.md#audiencesendcountinguniqueaction)

***

### audienceTeam?

> `optional` **audienceTeam**: `string`

Defined in: [packages/ui/src/zoid/audience.ts:27](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/5e374373abd8385ebf5d75eb0914a8916e99b31e/packages/ui/src/zoid/audience.ts#L27)

The team name of the audience participant

***

### baseUrl?

> `optional` **baseUrl**: `string`

Defined in: [packages/ui/src/zoid/base.ts:91](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/5e374373abd8385ebf5d75eb0914a8916e99b31e/packages/ui/src/zoid/base.ts#L91)

The base URL of the parent application

#### Inherited from

[`BaseSlidePluginProps`](BaseSlidePluginProps.md).[`baseUrl`](BaseSlidePluginProps.md#baseurl)

***

### onHeightChange()?

> `optional` **onHeightChange**: (`height`) => `void`

Defined in: [packages/ui/src/zoid/base.ts:89](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/5e374373abd8385ebf5d75eb0914a8916e99b31e/packages/ui/src/zoid/base.ts#L89)

Callback to report height changes from the child to the parent. 
Sending null signals the parent to use 100% height.

#### Parameters

##### height

The new height in pixels, or null for 100% height.

`number` | `null`

#### Returns

`void`

#### Inherited from

[`BaseSlidePluginProps`](BaseSlidePluginProps.md).[`onHeightChange`](BaseSlidePluginProps.md#onheightchange)

***

### presentation?

> `optional` **presentation**: `object` & `object`

Defined in: [packages/ui/src/zoid/audience.ts:14](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/5e374373abd8385ebf5d75eb0914a8916e99b31e/packages/ui/src/zoid/audience.ts#L14)

Presentation-wide settings and data that affect the plugin's appearance and behavior.

#### Type Declaration

##### accessCode?

> `optional` **accessCode**: `string`

The access code of the presentation

##### audienceAdmission?

> `optional` **audienceAdmission**: `string`

The audience admission setting (e.g., 'auto', 'manual')

##### audiencePacing?

> `optional` **audiencePacing**: `boolean`

Whether audience pacing is enabled

##### filteringProfanity?

> `optional` **filteringProfanity**: `boolean`

Whether profanity filtering is enabled

##### fontFamily?

> `optional` **fontFamily**: `string`

The font family name used in the presentation

##### id?

> `optional` **id**: `string` \| `number`

The unique identifier of the presentation

##### language?

> `optional` **language**: `string`

The language code (e.g., 'en', 'vi')

##### presenting?

> `optional` **presenting**: `boolean`

Whether the presentation is currently presenting

##### shareCode?

> `optional` **shareCode**: `string`

The share code of the presentation

##### showHyperLink?

> `optional` **showHyperLink**: `boolean`

Whether to show hyperlinks in the content

##### uniqueAccessCode?

> `optional` **uniqueAccessCode**: `string`

The unique access code of the presentation

#### Type Declaration

##### teamPlay?

> `optional` **teamPlay**: `Record`\<`string`, `any`\>

The teamplay object used in the presentation

#### Overrides

[`BaseSlidePluginProps`](BaseSlidePluginProps.md).[`presentation`](BaseSlidePluginProps.md#presentation)

***

### presentationColorPalette?

> `optional` **presentationColorPalette**: `string`[]

Defined in: [packages/ui/src/zoid/base.ts:40](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/5e374373abd8385ebf5d75eb0914a8916e99b31e/packages/ui/src/zoid/base.ts#L40)

Presentation-wide color palette attributes.

#### Inherited from

[`BaseSlidePluginProps`](BaseSlidePluginProps.md).[`presentationColorPalette`](BaseSlidePluginProps.md#presentationcolorpalette)

***

### presentationLighterColorPalette?

> `optional` **presentationLighterColorPalette**: `string`[]

Defined in: [packages/ui/src/zoid/base.ts:44](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/5e374373abd8385ebf5d75eb0914a8916e99b31e/packages/ui/src/zoid/base.ts#L44)

Presentation-wide lighter color palette attributes.

#### Inherited from

[`BaseSlidePluginProps`](BaseSlidePluginProps.md).[`presentationLighterColorPalette`](BaseSlidePluginProps.md#presentationlightercolorpalette)

***

### slide?

> `optional` **slide**: `object`

Defined in: [packages/ui/src/zoid/base.ts:48](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/5e374373abd8385ebf5d75eb0914a8916e99b31e/packages/ui/src/zoid/base.ts#L48)

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

#### Inherited from

[`BaseSlidePluginProps`](BaseSlidePluginProps.md).[`slide`](BaseSlidePluginProps.md#slide)

***

### slideAttributes?

> `optional` **slideAttributes**: `Record`\<`string`, `any`\>

Defined in: [packages/ui/src/zoid/audience.ts:31](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/5e374373abd8385ebf5d75eb0914a8916e99b31e/packages/ui/src/zoid/audience.ts#L31)

Custom attributes associated with the current slide.

***

### subscribeTopic()?

> `optional` **subscribeTopic**: (`options`) => `void`

Defined in: [packages/ui/src/zoid/base.ts:97](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/5e374373abd8385ebf5d75eb0914a8916e99b31e/packages/ui/src/zoid/base.ts#L97)

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

#### Inherited from

[`BaseSlidePluginProps`](BaseSlidePluginProps.md).[`subscribeTopic`](BaseSlidePluginProps.md#subscribetopic)

***

### trackGA4AndMixpanel()?

> `optional` **trackGA4AndMixpanel**: (`payload`) => `void`

Defined in: [packages/ui/src/zoid/base.ts:116](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/5e374373abd8385ebf5d75eb0914a8916e99b31e/packages/ui/src/zoid/base.ts#L116)

Action to track events to GA4 and Mixpanel.

#### Parameters

##### payload

`any`

The event payload to track.

#### Returns

`void`

#### Inherited from

[`BaseSlidePluginProps`](BaseSlidePluginProps.md).[`trackGA4AndMixpanel`](BaseSlidePluginProps.md#trackga4andmixpanel)

***

### unsubscribeTopic()?

> `optional` **unsubscribeTopic**: (`topic`) => `void`

Defined in: [packages/ui/src/zoid/base.ts:103](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/5e374373abd8385ebf5d75eb0914a8916e99b31e/packages/ui/src/zoid/base.ts#L103)

Unsubscribe from a specific MQTT topic.

#### Parameters

##### topic

`string`

The topic to unsubscribe from.

#### Returns

`void`

#### Inherited from

[`BaseSlidePluginProps`](BaseSlidePluginProps.md).[`unsubscribeTopic`](BaseSlidePluginProps.md#unsubscribetopic)

***

### url

> **url**: `string`

Defined in: [packages/ui/src/zoid/base.ts:8](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/5e374373abd8385ebf5d75eb0914a8916e99b31e/packages/ui/src/zoid/base.ts#L8)

The URL of the plugin to be loaded in the iframe

#### Inherited from

[`BaseSlidePluginProps`](BaseSlidePluginProps.md).[`url`](BaseSlidePluginProps.md#url)
