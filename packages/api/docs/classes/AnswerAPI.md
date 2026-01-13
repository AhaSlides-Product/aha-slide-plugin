[**@aha/api**](../README.md)

***

[@aha/api](../globals.md) / AnswerAPI

# Class: AnswerAPI

Defined in: answer.ts:56

API client for answer submission endpoints

## Example

```typescript
const api = new AnswerAPI('/api/live');

await api.submitAnswer({
  presentationId: 195273,
  slideId: 657195,
  vote: [7238853],
  // ... other fields
});
```

## Constructors

### Constructor

> **new AnswerAPI**(`baseUrl`): `AnswerAPI`

Defined in: answer.ts:64

Creates a new AnswerAPI instance

#### Parameters

##### baseUrl

`string`

Base URL for the API endpoints (e.g., '/api/live')

#### Returns

`AnswerAPI`

## Methods

### submitAnswer()

> **submitAnswer**(`payload`): `Promise`\<`void`\>

Defined in: answer.ts:101

Submit an answer for a quiz/poll slide

#### Parameters

##### payload

[`AnswerSubmissionPayload`](../interfaces/AnswerSubmissionPayload.md)

Answer submission data

#### Returns

`Promise`\<`void`\>

Promise that resolves when the answer is submitted

#### Example

```typescript
await api.submitAnswer({
  presentation: 195273,
  presentationId: 195273,
  slideId: 657195,
  slide: 657195,
  slideVersion: 1,
  audience: 'di_73851028c80d4b0d9dfb639936cea8dc-bb6f9953a8ad41a4',
  accessCode: 'm5xz3aou3t',
  slideTimestamp: '1768287827276',
  config: {
    timeToAnswer: 25,
    multipleChoice: false,
    SlideOptions: [
      { id: 7238853, correct: null },
      { id: 7238854, correct: true }
    ]
  },
  type: 'pickAnswer',
  slideType: 'imageChoice',
  vote: [7238853],
  audienceName: 'test',
  audienceEmoji: '🤹‍♂️'
});
```
