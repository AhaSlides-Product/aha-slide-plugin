[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / SlidePluginProps

# Interface: SlidePluginProps

Defined in: [packages/ui/src/zoid/presenter.ts:28](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/presenter.ts#L28)

Interface for the properties expected by the PresenterSlidePluginIframe component.

## Extends

- [`BaseSlidePluginProps`](BaseSlidePluginProps.md)

## Properties

### baseUrl?

> `optional` **baseUrl**: `string`

Defined in: [packages/ui/src/zoid/base.ts:92](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/base.ts#L92)

The base URL of the parent application

#### Inherited from

[`BaseSlidePluginProps`](BaseSlidePluginProps.md).[`baseUrl`](BaseSlidePluginProps.md#baseurl)

***

### closePluginModal()?

> `optional` **closePluginModal**: () => `void`

Defined in: [packages/ui/src/zoid/presenter.ts:104](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/presenter.ts#L104)

Close the currently open plugin modal.

#### Returns

`void`

***

### currentUser?

> `optional` **currentUser**: `object`

Defined in: [packages/ui/src/zoid/presenter.ts:36](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/presenter.ts#L36)

Information about the current user.

#### Index Signature

\[`key`: `string`\]: `any`

#### presenterLanguage?

> `optional` **presenterLanguage**: `string`

The language code of the presenter

***

### emitKeyboardEvent()?

> `optional` **emitKeyboardEvent**: (`event`) => `void`

Defined in: [packages/ui/src/zoid/presenter.ts:66](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/presenter.ts#L66)

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

Defined in: [packages/ui/src/zoid/presenter.ts:47](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/presenter.ts#L47)

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

Defined in: [packages/ui/src/zoid/base.ts:90](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/base.ts#L90)

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

Defined in: [packages/ui/src/zoid/presenter.ts:60](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/presenter.ts#L60)

Callback function to subscribe to keyboard events from the parent application.

#### Parameters

##### callback

(`event`) => `void`

The function to call when a keyboard event occurs.

#### Returns

`void`

***

### openPluginModal()?

> `optional` **openPluginModal**: (`path?`) => `void`

Defined in: [packages/ui/src/zoid/presenter.ts:100](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/presenter.ts#L100)

Open a full-screen modal with a custom path.

#### Parameters

##### path?

`string`

The custom path for the modal iframe.

#### Returns

`void`

***

### presentation?

> `optional` **presentation**: `object` & `object`

Defined in: [packages/ui/src/zoid/presenter.ts:29](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/presenter.ts#L29)

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

Defined in: [packages/ui/src/zoid/base.ts:41](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/base.ts#L41)

Presentation-wide color palette attributes.

#### Inherited from

[`BaseSlidePluginProps`](BaseSlidePluginProps.md).[`presentationColorPalette`](BaseSlidePluginProps.md#presentationcolorpalette)

***

### presentationLighterColorPalette?

> `optional` **presentationLighterColorPalette**: `string`[]

Defined in: [packages/ui/src/zoid/base.ts:45](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/base.ts#L45)

Presentation-wide lighter color palette attributes.

#### Inherited from

[`BaseSlidePluginProps`](BaseSlidePluginProps.md).[`presentationLighterColorPalette`](BaseSlidePluginProps.md#presentationlightercolorpalette)

***

### sendVoteOutcome()?

> `optional` **sendVoteOutcome**: (`payload`) => `void`

Defined in: [packages/ui/src/zoid/presenter.ts:95](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/presenter.ts#L95)

Send a vote outcome (vote count and tooltip) to the presenter app.

#### Parameters

##### payload

The vote outcome data.

###### tooltip?

`string`

###### voteCount

`number`

#### Returns

`void`

***

### showConfirmModal()?

> `optional` **showConfirmModal**: (`payload`) => `Promise`\<`boolean`\>

Defined in: [packages/ui/src/zoid/presenter.ts:106](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/presenter.ts#L106)

#### Parameters

##### payload

`ConfirmModalPayload`

#### Returns

`Promise`\<`boolean`\>

***

### showToastError()?

> `optional` **showToastError**: (`text`, `uniqName?`, `action?`, `options?`) => `void`

Defined in: [packages/ui/src/zoid/presenter.ts:90](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/presenter.ts#L90)

Show an error toast message in the parent app.

#### Parameters

##### text

`string`

The message to display.

##### uniqName?

`string`

A unique identifier for the toast.

##### action?

`any`

An optional action object.

##### options?

`any`

Additional toast options.

#### Returns

`void`

***

### showToastInfo()?

> `optional` **showToastInfo**: (`text`, `uniqName?`, `action?`, `options?`) => `void`

Defined in: [packages/ui/src/zoid/presenter.ts:74](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/presenter.ts#L74)

Show an info toast message in the parent app.

#### Parameters

##### text

`string`

The message to display.

##### uniqName?

`string`

A unique identifier for the toast.

##### action?

`any`

An optional action object.

##### options?

`any`

Additional toast options.

#### Returns

`void`

***

### showToastSuccess()?

> `optional` **showToastSuccess**: (`text`, `uniqName?`, `action?`, `options?`) => `void`

Defined in: [packages/ui/src/zoid/presenter.ts:82](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/presenter.ts#L82)

Show a success toast message in the parent app.

#### Parameters

##### text

`string`

The message to display.

##### uniqName?

`string`

A unique identifier for the toast.

##### action?

`any`

An optional action object.

##### options?

`any`

Additional toast options.

#### Returns

`void`

***

### slide?

> `optional` **slide**: `object`

Defined in: [packages/ui/src/zoid/base.ts:49](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/base.ts#L49)

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

Defined in: [packages/ui/src/zoid/base.ts:98](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/base.ts#L98)

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

Defined in: [packages/ui/src/zoid/base.ts:110](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/base.ts#L110)

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

Defined in: [packages/ui/src/zoid/base.ts:104](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/base.ts#L104)

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

Defined in: [packages/ui/src/zoid/presenter.ts:54](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/presenter.ts#L54)

Action to create or update a specific attribute for the current slide in the parent application.

#### Returns

`Promise`\<[`ImageUploadResult`](ImageUploadResult.md)\>

A promise resolving when the update is complete.

***

### url

> **url**: `string`

Defined in: [packages/ui/src/zoid/base.ts:9](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/base.ts#L9)

The URL of the plugin to be loaded in the iframe

#### Inherited from

[`BaseSlidePluginProps`](BaseSlidePluginProps.md).[`url`](BaseSlidePluginProps.md#url)
