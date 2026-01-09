# Sample Slide Backend

This is a sample backend for an AhaSlides plugin. It illustrates how to handle slide interactions from the audience.

## For App Implementers

When implementing a custom slide plugin, your backend only needs to provide a single endpoint to process audience answers.

### endpoint: `POST /ranking`

The backend should implement a `POST` endpoint (in this sample, it's mapped to `/ranking`) that accepts the answer payload and returns a result.

#### Request Schema

The request body follows the `SubmitAnswerDto` schema defined in [`@aha/backend-utils`](../../../packages/backend-utils/docs/classes/SubmitAnswerDto.md):

- `presentationId`: number
- `slideId`: number
- `audienceId`: string
- `slideVersion`: number
- `answer`: string[] (ordered list of selected options)
- `audience`: string (audience session ID)
- `audienceName`: string
- `audienceEmoji`: string

#### Response Schema

The response **must** conform to the [`AnswerResult`](../../../packages/backend-utils/docs/interfaces/AnswerResult.md) interface defined in `@aha/backend-utils`:

```typescript
export interface AnswerResult {
  presentation: number;
  slide: number;
  version: number;
  count_total: CountTotal; // Array of items to be aggregated in stats
  point: number;           // Points awarded to the audience
  audience: string;
  audienceName: string;
  audienceEmoji?: string;
  correct: boolean;        // Whether the answer is considered correct
  data: string;           // Stringified raw answer data
}
```

Implementers should focus on the `processAnswer` logic within the `AppService` (or equivalent) to calculate points and stats aggregation (`count_total`).
