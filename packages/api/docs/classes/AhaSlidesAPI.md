[**@aha/api**](../README.md)

***

[@aha/api](../globals.md) / AhaSlidesAPI

# Class: AhaSlidesAPI

Defined in: client.ts:34

Unified API client for AhaSlides endpoints

Provides access to both counting and answer submission APIs through a single instance.

## Example

```typescript
const api = new AhaSlidesAPI('/api/live');

// Submit an answer
await api.submitAnswer({
  presentationId: 195273,
  slideId: 657195,
  vote: [7238853],
  // ... other fields
});

// Count total
await api.countTotal([
  { bucket: 'presentation-123', key: 'views', increaseBy: 1 }
]);

// Count unique
await api.countUnique([
  { bucket: 'presentation-123', key: 'unique-viewers', item: 'user-456' }
]);
```

## Constructors

### Constructor

> **new AhaSlidesAPI**(`baseUrl`): `AhaSlidesAPI`

Defined in: client.ts:43

Creates a new AhaSlidesAPI instance

#### Parameters

##### baseUrl

`string`

Base URL for the API endpoints (e.g., '/api/live')

#### Returns

`AhaSlidesAPI`

## Methods

### countTotal()

> **countTotal**(`counts`): `Promise`\<`void`\>

Defined in: client.ts:64

Increment total counts for one or more bucket/key combinations

#### Parameters

##### counts

[`CountTotalPayload`](../interfaces/CountTotalPayload.md)[]

Array of count operations to perform

#### Returns

`Promise`\<`void`\>

Promise that resolves when the count operation completes

***

### countUnique()

> **countUnique**(`counts`): `Promise`\<`void`\>

Defined in: client.ts:74

Track unique items for one or more bucket/key combinations

#### Parameters

##### counts

[`CountUniquePayload`](../interfaces/CountUniquePayload.md)[]

Array of unique count operations to perform

#### Returns

`Promise`\<`void`\>

Promise that resolves when the count operation completes

***

### submitAnswer()

> **submitAnswer**(`payload`): `Promise`\<`void`\>

Defined in: client.ts:54

Submit an answer for a quiz/poll slide

#### Parameters

##### payload

[`AnswerSubmissionPayload`](../interfaces/AnswerSubmissionPayload.md)

Answer submission data

#### Returns

`Promise`\<`void`\>

Promise that resolves when the answer is submitted
