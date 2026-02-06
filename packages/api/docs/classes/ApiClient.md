[**@aha/api**](../README.md)

***

[@aha/api](../globals.md) / ApiClient

# Class: ApiClient

Defined in: [api/src/submission.ts:4](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/924cf70c3514213c6fa8e9f8a90e3dcc697a9b79/packages/api/src/submission.ts#L4)

## Constructors

### Constructor

> **new ApiClient**(`baseUrl`, `accessToken?`): `ApiClient`

Defined in: [api/src/submission.ts:10](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/924cf70c3514213c6fa8e9f8a90e3dcc697a9b79/packages/api/src/submission.ts#L10)

#### Parameters

##### baseUrl

`string`

##### accessToken?

`string`

#### Returns

`ApiClient`

## Methods

### deleteSubmission()

> **deleteSubmission**(`submissionId`): `Promise`\<`Response`\>

Defined in: [api/src/submission.ts:50](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/924cf70c3514213c6fa8e9f8a90e3dcc697a9b79/packages/api/src/submission.ts#L50)

This API is used by presenter to delete a submission.

#### Parameters

##### submissionId

`string`

#### Returns

`Promise`\<`Response`\>

***

### fetchUrl()

> **fetchUrl**(`url`, `options?`): `Promise`\<`any`\>

Defined in: [api/src/submission.ts:17](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/924cf70c3514213c6fa8e9f8a90e3dcc697a9b79/packages/api/src/submission.ts#L17)

#### Parameters

##### url

`string`

##### options?

`RequestInit`

#### Returns

`Promise`\<`any`\>

***

### getParticipantSubmissions()

> **getParticipantSubmissions**\<`T`\>(`audienceId`, `slideId`): `Promise`\<[`SubmissionPayload`](../interfaces/SubmissionPayload.md)\<`T`\> & `object`[]\>

Defined in: [api/src/submission.ts:103](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/924cf70c3514213c6fa8e9f8a90e3dcc697a9b79/packages/api/src/submission.ts#L103)

List submissions of an audience

#### Type Parameters

##### T

`T`

#### Parameters

##### audienceId

###### audienceId

`string`

###### slideId

`string`

###### slideVersion

`string`

###### type?

`string`

##### slideId

###### limit?

`number`

###### offset?

`number`

#### Returns

`Promise`\<[`SubmissionPayload`](../interfaces/SubmissionPayload.md)\<`T`\> & `object`[]\>

***

### getSubmissions()

> **getSubmissions**\<`T`\>(`slideId`, `slideVersion`): `Promise`\<[`SubmissionPayload`](../interfaces/SubmissionPayload.md)\<`T`\> & `object`[]\>

Defined in: [api/src/submission.ts:76](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/924cf70c3514213c6fa8e9f8a90e3dcc697a9b79/packages/api/src/submission.ts#L76)

List by slideId with optional slideVersion and type (query params)

#### Type Parameters

##### T

`T`

#### Parameters

##### slideId

###### slideId

`string`

###### slideVersion?

`string`

###### type?

`string`

##### slideVersion

###### limit?

`number`

###### offset?

`number`

#### Returns

`Promise`\<[`SubmissionPayload`](../interfaces/SubmissionPayload.md)\<`T`\> & `object`[]\>

***

### sendLiveSubmission()

> **sendLiveSubmission**\<`T`\>(`slideType`, `payload`): `Promise`\<`Response`\>

Defined in: [api/src/submission.ts:36](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/924cf70c3514213c6fa8e9f8a90e3dcc697a9b79/packages/api/src/submission.ts#L36)

Send submission to liveproxy. This API is used by audience to submit their response.

#### Type Parameters

##### T

`T`

#### Parameters

##### slideType

[`SlideType`](../enumerations/SlideType.md)

##### payload

[`SubmissionPayload`](../interfaces/SubmissionPayload.md)\<`T`\>

#### Returns

`Promise`\<`Response`\>

***

### updateSubmission()

> **updateSubmission**\<`T`\>(`submissionId`, `payload`): `Promise`\<`Response`\>

Defined in: [api/src/submission.ts:58](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/924cf70c3514213c6fa8e9f8a90e3dcc697a9b79/packages/api/src/submission.ts#L58)

#### Type Parameters

##### T

`T`

#### Parameters

##### submissionId

`string`

##### payload

[`SubmissionPayload`](../interfaces/SubmissionPayload.md)\<`T`\>

#### Returns

`Promise`\<`Response`\>
