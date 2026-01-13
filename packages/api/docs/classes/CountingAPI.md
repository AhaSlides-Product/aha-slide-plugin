[**@aha/api**](../README.md)

***

[@aha/api](../globals.md) / CountingAPI

# Class: CountingAPI

Defined in: counting.ts:19

API client for AhaSlides counting endpoints

## Example

```typescript
const api = new CountingAPI('/api/live');

await api.countTotal([
  { bucket: 'presentation-123', key: 'views', increaseBy: 1 }
]);

await api.countUnique([
  { bucket: 'presentation-123', key: 'unique-viewers', item: 'user-456' }
]);
```

## Constructors

### Constructor

> **new CountingAPI**(`baseUrl`): `CountingAPI`

Defined in: counting.ts:27

Creates a new CountingAPI instance

#### Parameters

##### baseUrl

`string`

Base URL for the API endpoints (e.g., '/api/live')

#### Returns

`CountingAPI`

## Methods

### countTotal()

> **countTotal**(`counts`): `Promise`\<`void`\>

Defined in: counting.ts:45

Increment total counts for one or more bucket/key combinations

#### Parameters

##### counts

[`CountTotalPayload`](../interfaces/CountTotalPayload.md)[]

Array of count operations to perform

#### Returns

`Promise`\<`void`\>

Promise that resolves when the count operation completes

#### Example

```typescript
await api.countTotal([
  { bucket: 'presentation-123', key: 'views', increaseBy: 1 },
  { bucket: 'presentation-123', key: 'interactions', increaseBy: 5 }
]);
```

***

### countUnique()

> **countUnique**(`counts`): `Promise`\<`void`\>

Defined in: counting.ts:73

Track unique items for one or more bucket/key combinations

#### Parameters

##### counts

[`CountUniquePayload`](../interfaces/CountUniquePayload.md)[]

Array of unique count operations to perform

#### Returns

`Promise`\<`void`\>

Promise that resolves when the count operation completes

#### Example

```typescript
await api.countUnique([
  { bucket: 'presentation-123', key: 'unique-viewers', item: 'user-456' },
  { bucket: 'presentation-123', key: 'unique-participants', item: 'user-789' }
]);
```
