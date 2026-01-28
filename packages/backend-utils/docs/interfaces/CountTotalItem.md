[**@aha/backend-utils**](../README.md)

***

[@aha/backend-utils](../README.md) / CountTotalItem

# Interface: CountTotalItem

Defined in: [SubmissionResult.ts:4](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/084fa1a64aab79408b40af8fe107c55abe7287fa/packages/backend-utils/src/SubmissionResult.ts#L4)

Represents a single item in the aggregated statistics.

## Properties

### bucket

> **bucket**: `string`

Defined in: [SubmissionResult.ts:6](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/084fa1a64aab79408b40af8fe107c55abe7287fa/packages/backend-utils/src/SubmissionResult.ts#L6)

The bucket name for aggregation (e.g., slide-specific path).

***

### increase\_by

> **increase\_by**: `number`

Defined in: [SubmissionResult.ts:10](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/084fa1a64aab79408b40af8fe107c55abe7287fa/packages/backend-utils/src/SubmissionResult.ts#L10)

The amount to increase the stat by.

***

### key

> **key**: `string`

Defined in: [SubmissionResult.ts:8](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/084fa1a64aab79408b40af8fe107c55abe7287fa/packages/backend-utils/src/SubmissionResult.ts#L8)

The key within the bucket (e.g., the answer option).
