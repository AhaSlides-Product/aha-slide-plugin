[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / SlidePluginProps

# Interface: SlidePluginProps

Defined in: [packages/ui/src/zoid/presenter.ts:14](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/084fa1a64aab79408b40af8fe107c55abe7287fa/packages/ui/src/zoid/presenter.ts#L14)

Interface for the properties expected by the PresenterSlidePluginIframe component.

## Extends

- [`BaseSlidePluginProps`](BaseSlidePluginProps.md)

## Properties

### audienceSendCountingUniqueAction()?

> `optional` **audienceSendCountingUniqueAction**: (`payload?`) => `Promise`\<`any`\>

Defined in: [packages/ui/src/zoid/base.ts:110](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/084fa1a64aab79408b40af8fe107c55abe7287fa/packages/ui/src/zoid/base.ts#L110)

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

### baseUrl?

> `optional` **baseUrl**: `string`

Defined in: [packages/ui/src/zoid/base.ts:91](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/084fa1a64aab79408b40af8fe107c55abe7287fa/packages/ui/src/zoid/base.ts#L91)

The base URL of the parent application

#### Inherited from

[`BaseSlidePluginProps`](BaseSlidePluginProps.md).[`baseUrl`](BaseSlidePluginProps.md#baseurl)

***

### emitKeyboardEvent()?

> `optional` **emitKeyboardEvent**: (`event`) => `void`

Defined in: [packages/ui/src/zoid/presenter.ts:44](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/084fa1a64aab79408b40af8fe107c55abe7287fa/packages/ui/src/zoid/presenter.ts#L44)

Action to emit a keyboard event from the plugin to the parent application.

#### Parameters

##### event

[`PluginKeyboardEvent`](PluginKeyboardEvent.md)

The keyboard event data to emit.

#### Returns

`void`

***

### getSlideAttributesAction()?

> `optional` **getSlideAttributesAction**: (`slideId?`) => `Promise`\<`any`\>

Defined in: [packages/ui/src/zoid/presenter.ts:25](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/084fa1a64aab79408b40af8fe107c55abe7287fa/packages/ui/src/zoid/presenter.ts#L25)

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

Defined in: [packages/ui/src/zoid/base.ts:89](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/084fa1a64aab79408b40af8fe107c55abe7287fa/packages/ui/src/zoid/base.ts#L89)

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

### onKeyboard()?

> `optional` **onKeyboard**: (`callback`) => `void`

Defined in: [packages/ui/src/zoid/presenter.ts:38](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/084fa1a64aab79408b40af8fe107c55abe7287fa/packages/ui/src/zoid/presenter.ts#L38)

Callback function to subscribe to keyboard events from the parent application.

#### Parameters

##### callback

(`event`) => `void`

The function to call when a keyboard event occurs.

#### Returns

`void`

***

### presentation?

> `optional` **presentation**: `object` & `object`

Defined in: [packages/ui/src/zoid/presenter.ts:15](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/084fa1a64aab79408b40af8fe107c55abe7287fa/packages/ui/src/zoid/presenter.ts#L15)

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

##### teamplay?

> `optional` **teamplay**: `Record`\<`string`, `any`\>

The teamplay object used in the presentation

#### Overrides

[`BaseSlidePluginProps`](BaseSlidePluginProps.md).[`presentation`](BaseSlidePluginProps.md#presentation)

***

### presentationColorPalette?

> `optional` **presentationColorPalette**: `string`[]

Defined in: [packages/ui/src/zoid/base.ts:40](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/084fa1a64aab79408b40af8fe107c55abe7287fa/packages/ui/src/zoid/base.ts#L40)

Presentation-wide color palette attributes.

#### Inherited from

[`BaseSlidePluginProps`](BaseSlidePluginProps.md).[`presentationColorPalette`](BaseSlidePluginProps.md#presentationcolorpalette)

***

### presentationLighterColorPalette?

> `optional` **presentationLighterColorPalette**: `string`[]

Defined in: [packages/ui/src/zoid/base.ts:44](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/084fa1a64aab79408b40af8fe107c55abe7287fa/packages/ui/src/zoid/base.ts#L44)

Presentation-wide lighter color palette attributes.

#### Inherited from

[`BaseSlidePluginProps`](BaseSlidePluginProps.md).[`presentationLighterColorPalette`](BaseSlidePluginProps.md#presentationlightercolorpalette)

***

### slide?

> `optional` **slide**: `object`

Defined in: [packages/ui/src/zoid/base.ts:48](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/084fa1a64aab79408b40af8fe107c55abe7287fa/packages/ui/src/zoid/base.ts#L48)

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

### subscribeTopic()?

> `optional` **subscribeTopic**: (`options`) => `void`

Defined in: [packages/ui/src/zoid/base.ts:97](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/084fa1a64aab79408b40af8fe107c55abe7287fa/packages/ui/src/zoid/base.ts#L97)

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

Defined in: [packages/ui/src/zoid/base.ts:116](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/084fa1a64aab79408b40af8fe107c55abe7287fa/packages/ui/src/zoid/base.ts#L116)

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

Defined in: [packages/ui/src/zoid/base.ts:103](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/084fa1a64aab79408b40af8fe107c55abe7287fa/packages/ui/src/zoid/base.ts#L103)

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

### uploadImage()

> **uploadImage**: () => `Promise`\<[`ImageUploadResult`](ImageUploadResult.md)\>

Defined in: [packages/ui/src/zoid/presenter.ts:32](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/084fa1a64aab79408b40af8fe107c55abe7287fa/packages/ui/src/zoid/presenter.ts#L32)

Action to create or update a specific attribute for the current slide in the parent application.

#### Returns

`Promise`\<[`ImageUploadResult`](ImageUploadResult.md)\>

A promise resolving when the update is complete.

***

### url

> **url**: `string`

Defined in: [packages/ui/src/zoid/base.ts:8](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/084fa1a64aab79408b40af8fe107c55abe7287fa/packages/ui/src/zoid/base.ts#L8)

The URL of the plugin to be loaded in the iframe

#### Inherited from

[`BaseSlidePluginProps`](BaseSlidePluginProps.md).[`url`](BaseSlidePluginProps.md#url)
