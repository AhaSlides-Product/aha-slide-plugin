# @aha/api

API client wrapper for AhaSlides endpoints. This package provides TypeScript methods to interact with counting and answer submission APIs.

## Installation

```bash
npm install @aha/api
```

## Usage

### Unified API Client (Recommended)

Use the `AhaSlidesAPI` class for a single instance that provides access to all endpoints:

```typescript
import { AhaSlidesAPI } from '@aha/api';

const api = new AhaSlidesAPI('/api/live');

// Submit an answer
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

// Count total
await api.countTotal([
  { bucket: 'presentation-123', key: 'views', increaseBy: 1 }
]);

// Count unique
await api.countUnique([
  { bucket: 'presentation-123', key: 'unique-viewers', item: 'user-456' }
]);
```

### Individual API Clients

You can also use individual API clients if you only need specific functionality:

```typescript
import { CountingAPI, AnswerAPI } from '@aha/api';

const countingApi = new CountingAPI('/api/live');
const answerApi = new AnswerAPI('/api/live');
```

## API Reference

### AhaSlidesAPI

The unified API client that provides access to all endpoints.

#### Constructor

```typescript
new AhaSlidesAPI(baseUrl: string)
```

**Parameters:**
- `baseUrl` (string): Base URL for the API endpoints (e.g., '/api/live')

#### submitAnswer

Submit an answer for a quiz/poll slide.

**Signature:**
```typescript
submitAnswer(payload: AnswerSubmissionPayload): Promise<void>
```

**Parameters:**
- `payload`: Answer submission data including:
  - `presentation` (number): Presentation ID
  - `presentationId` (number): Presentation ID (duplicate)
  - `slideId` (number): Slide ID
  - `slide` (number): Slide ID (duplicate)
  - `slideVersion` (number): Version of the slide
  - `audience` (string): Audience identifier
  - `accessCode` (string): Access code for the presentation
  - `slideTimestamp` (string): Timestamp when slide was loaded
  - `config` (object): Slide configuration
  - `type` (string): Answer type (e.g., 'pickAnswer')
  - `slideType` (string): Slide type (e.g., 'imageChoice')
  - `vote` (number[]): Array of selected option IDs
  - `audienceName` (string, optional): Participant name
  - `audienceEmoji` (string, optional): Participant emoji

#### countTotal

Increment total counts for one or more bucket/key combinations.

**Signature:**
```typescript
countTotal(counts: CountTotalPayload[]): Promise<void>
```

**Parameters:**
- `counts`: Array of count operations, where each operation includes:
  - `bucket` (string): The bucket identifier for grouping counts
  - `key` (string): The key identifier within the bucket
  - `increaseBy` (number, optional): The amount to increase the count by (default: 1)

#### countUnique

Track unique items for one or more bucket/key combinations.

**Signature:**
```typescript
countUnique(counts: CountUniquePayload[]): Promise<void>
```

**Parameters:**
- `counts`: Array of unique count operations, where each operation includes:
  - `bucket` (string): The bucket identifier for grouping counts
  - `key` (string): The key identifier within the bucket
  - `item` (string): The unique item identifier to count

## Types

### AnswerSubmissionPayload

```typescript
interface AnswerSubmissionPayload {
  presentation: number;
  presentationId: number;
  slideId: number;
  slide: number;
  slideVersion: number;
  audience: string;
  accessCode: string;
  slideTimestamp: string;
  config: object;
  type: string;
  slideType: string;
  vote: number[];
  audienceName?: string;
  audienceEmoji?: string;
}
```

### CountTotalPayload

```typescript
interface CountTotalPayload {
  bucket: string;
  key: string;
  increaseBy?: number;
}
```

### CountUniquePayload

```typescript
interface CountUniquePayload {
  bucket: string;
  key: string;
  item: string;
}
```

## Error Handling

All methods throw errors if the API request fails. Always wrap calls in try-catch blocks:

```typescript
try {
  await api.submitAnswer(payload);
} catch (error) {
  console.error('Failed to submit answer:', error);
}
```

## Building

```bash
npm run build
```

## Documentation

Generate TypeDoc documentation:

```bash
npm run docs
```
