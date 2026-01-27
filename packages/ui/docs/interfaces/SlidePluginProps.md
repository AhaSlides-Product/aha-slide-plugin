[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / SlidePluginProps

# Interface: SlidePluginProps

Defined in: [packages/ui/src/zoid.ts:124](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/403f83f2cd6eb475da8c8eab1790751e8bbb3484/packages/ui/src/zoid.ts#L124)

Interface for the properties expected by the PresenterSlidePluginIframe component.

## Extends

- [`BaseSlidePluginProps`](BaseSlidePluginProps.md)

## Properties

### audienceSendCountingUniqueAction()?

> `optional` **audienceSendCountingUniqueAction**: (`payload?`) => `Promise`\<`any`\>

Defined in: [packages/ui/src/zoid.ts:112](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/403f83f2cd6eb475da8c8eab1790751e8bbb3484/packages/ui/src/zoid.ts#L112)

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

Defined in: [packages/ui/src/zoid.ts:93](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/403f83f2cd6eb475da8c8eab1790751e8bbb3484/packages/ui/src/zoid.ts#L93)

The base URL of the parent application

#### Inherited from

[`BaseSlidePluginProps`](BaseSlidePluginProps.md).[`baseUrl`](BaseSlidePluginProps.md#baseurl)

***

### getSlideAttributesAction()?

> `optional` **getSlideAttributesAction**: (`slideId?`) => `Promise`\<`any`\>

Defined in: [packages/ui/src/zoid.ts:135](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/403f83f2cd6eb475da8c8eab1790751e8bbb3484/packages/ui/src/zoid.ts#L135)

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

Defined in: [packages/ui/src/zoid.ts:91](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/403f83f2cd6eb475da8c8eab1790751e8bbb3484/packages/ui/src/zoid.ts#L91)

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

Defined in: [packages/ui/src/zoid.ts:125](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/403f83f2cd6eb475da8c8eab1790751e8bbb3484/packages/ui/src/zoid.ts#L125)

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

Defined in: [packages/ui/src/zoid.ts:42](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/403f83f2cd6eb475da8c8eab1790751e8bbb3484/packages/ui/src/zoid.ts#L42)

Presentation-wide color palette attributes.

#### Inherited from

[`BaseSlidePluginProps`](BaseSlidePluginProps.md).[`presentationColorPalette`](BaseSlidePluginProps.md#presentationcolorpalette)

***

### presentationLighterColorPalette?

> `optional` **presentationLighterColorPalette**: `string`[]

Defined in: [packages/ui/src/zoid.ts:46](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/403f83f2cd6eb475da8c8eab1790751e8bbb3484/packages/ui/src/zoid.ts#L46)

Presentation-wide lighter color palette attributes.

#### Inherited from

[`BaseSlidePluginProps`](BaseSlidePluginProps.md).[`presentationLighterColorPalette`](BaseSlidePluginProps.md#presentationlightercolorpalette)

***

### slide?

> `optional` **slide**: `object`

Defined in: [packages/ui/src/zoid.ts:50](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/403f83f2cd6eb475da8c8eab1790751e8bbb3484/packages/ui/src/zoid.ts#L50)

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

Defined in: [packages/ui/src/zoid.ts:99](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/403f83f2cd6eb475da8c8eab1790751e8bbb3484/packages/ui/src/zoid.ts#L99)

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

Defined in: [packages/ui/src/zoid.ts:118](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/403f83f2cd6eb475da8c8eab1790751e8bbb3484/packages/ui/src/zoid.ts#L118)

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

Defined in: [packages/ui/src/zoid.ts:105](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/403f83f2cd6eb475da8c8eab1790751e8bbb3484/packages/ui/src/zoid.ts#L105)

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

### openEditImageModal()?

> `optional` **openEditImageModal**: (`currentImageUrl`) => `Promise`\<[`ImageUploadResult`](ImageUploadResult.md)\>

Defined in: [packages/ui/src/zoid.ts:470](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/403f83f2cd6eb475da8c8eab1790751e8bbb3484/packages/ui/src/zoid.ts#L470)

Opens a modal in the parent application that allows the user to edit an existing image.
The modal provides image editing capabilities and returns the edited image result.

#### Parameters

##### currentImageUrl

`string`

The URL of the current image to be edited.

#### Returns

`Promise`\<[`ImageUploadResult`](ImageUploadResult.md)\>

A promise that resolves to the edited image upload result containing the new URL and metadata.

#### Example

```typescript
const handleEditImage = async () => {
  if (openEditImageModal && imageUrl.value) {
    const result = await openEditImageModal(imageUrl.value);
    imageUrl.value = result.url;
    console.log('Image edited successfully:', result);
  }
};
```

***

### openUploadImageModal()?

> `optional` **openUploadImageModal**: () => `Promise`\<[`ImageUploadResult`](ImageUploadResult.md)\>

Defined in: [packages/ui/src/zoid.ts:469](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/403f83f2cd6eb475da8c8eab1790751e8bbb3484/packages/ui/src/zoid.ts#L469)

Opens a modal in the parent application that allows the user to select and upload an image.
This provides a UI-based approach to image uploading, as opposed to programmatic upload via `uploadImage`.

#### Returns

`Promise`\<[`ImageUploadResult`](ImageUploadResult.md)\>

A promise that resolves to the image upload result containing the URL and metadata.

#### Example

```typescript
const handleImageUpload = async () => {
  if (openUploadImageModal) {
    const result = await openUploadImageModal();
    imageUrl.value = result.url;
    console.log('Image uploaded:', result);
  }
};
```

***

### uploadImage()?

> `optional` **uploadImage**: (`file`) => `Promise`\<[`ImageUploadResult`](ImageUploadResult.md)\>

Defined in: [packages/ui/src/zoid.ts:468](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/403f83f2cd6eb475da8c8eab1790751e8bbb3484/packages/ui/src/zoid.ts#L468)

Programmatically uploads an image file to the parent application's hosting service.
This function accepts a File object (typically from an input or drag-and-drop event) and handles the upload process.

#### Parameters

##### file

`File`

The image file to upload. Must be a valid File object (Blob).

#### Returns

`Promise`\<[`ImageUploadResult`](ImageUploadResult.md)\>

A promise that resolves to the image upload result containing the URL, path, and any additional metadata.

#### Example

```typescript
// Using with Ant Design Upload component
const handleCustomUpload = async (options: any) => {
  const { file } = options;
  
  if (uploadImage) {
    const result = await uploadImage(file.originFileObj);
    imageUrl.value = result.url;
    console.log('Image uploaded successfully:', result);
  }
};
```

***

### upsertSlideAttributeAction()?

> `optional` **upsertSlideAttributeAction**: (`payload`) => `Promise`\<`any`\>

Defined in: [packages/ui/src/zoid.ts:142](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/403f83f2cd6eb475da8c8eab1790751e8bbb3484/packages/ui/src/zoid.ts#L142)

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

Defined in: [packages/ui/src/zoid.ts:10](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/403f83f2cd6eb475da8c8eab1790751e8bbb3484/packages/ui/src/zoid.ts#L10)

The URL of the plugin to be loaded in the iframe

#### Inherited from

[`BaseSlidePluginProps`](BaseSlidePluginProps.md).[`url`](BaseSlidePluginProps.md#url)
