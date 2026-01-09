[**@aha/backend-utils**](../README.md)

***

[@aha/backend-utils](../README.md) / AnswerResult

# Interface: AnswerResult

Defined in: AnswerResult.ts:21

Represents the result of an audience answer submission processed by the backend.

## Properties

### audience

> **audience**: `string`

Defined in: AnswerResult.ts:33

The audience member identifier.

***

### audienceEmoji?

> `optional` **audienceEmoji**: `string`

Defined in: AnswerResult.ts:37

Optional emoji representing the audience member.

***

### audienceName

> **audienceName**: `string`

Defined in: AnswerResult.ts:35

The display name of the audience member.

***

### correct

> **correct**: `boolean`

Defined in: AnswerResult.ts:39

Whether the answer was considered correct.

***

### count\_total

> **count\_total**: [`CountTotal`](../type-aliases/CountTotal.md)

Defined in: AnswerResult.ts:29

Aggregated statistics data.

***

### data

> **data**: `string`

Defined in: AnswerResult.ts:41

Stringified raw answer data for persistence.

***

### point

> **point**: `number`

Defined in: AnswerResult.ts:31

Points awarded to the audience member for this answer.

***

### presentation

> **presentation**: `number`

Defined in: AnswerResult.ts:23

The unique identifier of the presentation.

***

### slide

> **slide**: `number`

Defined in: AnswerResult.ts:25

The unique identifier of the slide.

***

### version

> **version**: `number`

Defined in: AnswerResult.ts:27

The version number of the slide.
