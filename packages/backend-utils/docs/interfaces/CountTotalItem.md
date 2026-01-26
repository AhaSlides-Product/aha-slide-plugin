[**@aha/backend-utils**](../README.md)

***

[@aha/backend-utils](../README.md) / CountTotalItem

# Interface: CountTotalItem

Defined in: [AnswerResult.ts:4](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/bf5daf7f9bcfd4441ec675a1339242de93661955/packages/backend-utils/src/AnswerResult.ts#L4)

Represents a single item in the aggregated statistics.

## Properties

### bucket

> **bucket**: `string`

Defined in: [AnswerResult.ts:6](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/bf5daf7f9bcfd4441ec675a1339242de93661955/packages/backend-utils/src/AnswerResult.ts#L6)

The bucket name for aggregation (e.g., slide-specific path).

***

### increase\_by

> **increase\_by**: `number`

Defined in: [AnswerResult.ts:10](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/bf5daf7f9bcfd4441ec675a1339242de93661955/packages/backend-utils/src/AnswerResult.ts#L10)

The amount to increase the stat by.

***

### key

> **key**: `string`

Defined in: [AnswerResult.ts:8](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/bf5daf7f9bcfd4441ec675a1339242de93661955/packages/backend-utils/src/AnswerResult.ts#L8)

The key within the bucket (e.g., the answer option).
