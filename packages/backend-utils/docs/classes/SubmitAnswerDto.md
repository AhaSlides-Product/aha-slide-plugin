[**@aha/backend-utils**](../README.md)

***

[@aha/backend-utils](../README.md) / SubmitAnswerDto

# Class: SubmitAnswerDto

Defined in: submit-answer.dto.ts:4

Data Transfer Object for ranking slide answer submission.

## Constructors

### Constructor

> **new SubmitAnswerDto**(): `SubmitAnswerDto`

#### Returns

`SubmitAnswerDto`

## Properties

### answer

> **answer**: `string`[]

Defined in: submit-answer.dto.ts:14

The ordered list of answer options selected by the audience.

***

### audience

> **audience**: `string`

Defined in: submit-answer.dto.ts:16

The audience session ID.

***

### audienceEmoji

> **audienceEmoji**: `string`

Defined in: submit-answer.dto.ts:20

The emoji representation of the audience member.

***

### audienceId

> **audienceId**: `string`

Defined in: submit-answer.dto.ts:10

The session identifier of the audience member.

***

### audienceName

> **audienceName**: `string`

Defined in: submit-answer.dto.ts:18

The display name of the audience member.

***

### presentationId

> **presentationId**: `number`

Defined in: submit-answer.dto.ts:6

The unique identifier of the presentation.

***

### slideId

> **slideId**: `number`

Defined in: submit-answer.dto.ts:8

The unique identifier of the slide.

***

### slideVersion

> **slideVersion**: `number`

Defined in: submit-answer.dto.ts:12

The version number of the slide being answered.
