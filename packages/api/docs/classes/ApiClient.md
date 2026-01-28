[**@aha/api**](../README.md)

***

[@aha/api](../globals.md) / ApiClient

# Class: ApiClient

Defined in: [submission.ts:9](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/5e374373abd8385ebf5d75eb0914a8916e99b31e/packages/api/src/submission.ts#L9)

## Constructors

### Constructor

> **new ApiClient**(`baseUrl`): `ApiClient`

Defined in: [submission.ts:12](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/5e374373abd8385ebf5d75eb0914a8916e99b31e/packages/api/src/submission.ts#L12)

#### Parameters

##### baseUrl

`string`

#### Returns

`ApiClient`

## Methods

### sendSubmission()

> **sendSubmission**\<`T`\>(`payload`): `Promise`\<`Response`\>

Defined in: [submission.ts:16](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/5e374373abd8385ebf5d75eb0914a8916e99b31e/packages/api/src/submission.ts#L16)

#### Type Parameters

##### T

`T`

#### Parameters

##### payload

[`SubmissionPayload`](../interfaces/SubmissionPayload.md)\<`T`\>

#### Returns

`Promise`\<`Response`\>
