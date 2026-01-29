[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / ImageUploadResult

# Interface: ImageUploadResult

Defined in: [packages/ui/src/image.ts:4](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/5e374373abd8385ebf5d75eb0914a8916e99b31e/packages/ui/src/image.ts#L4)

Represents the result of an image upload.

## Indexable

\[`key`: `string`\]: `any`

Any additional metadata returned by the upload service.

## Properties

### path

> **path**: `string`

Defined in: [packages/ui/src/image.ts:6](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/5e374373abd8385ebf5d75eb0914a8916e99b31e/packages/ui/src/image.ts#L6)

The static asset paths. This one should be save on the database, so it can be used to sign the new URL later

***

### url

> **url**: `string`

Defined in: [packages/ui/src/image.ts:8](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/5e374373abd8385ebf5d75eb0914a8916e99b31e/packages/ui/src/image.ts#L8)

The public URL of the uploaded image.
