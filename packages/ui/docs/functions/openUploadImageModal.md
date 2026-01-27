[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / openUploadImageModal

# Function: openUploadImageModal()

> **openUploadImageModal**(): `Promise`\<[`ImageUploadResult`](../interfaces/ImageUploadResult.md)\>

Defined in: [packages/ui/src/zoid.ts:469](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/403f83f2cd6eb475da8c8eab1790751e8bbb3484/packages/ui/src/zoid.ts#L469)

Opens a modal in the parent application that allows the user to select and upload an image.
This provides a UI-based approach to image uploading, as opposed to programmatic upload via `uploadImage`.

## Returns

`Promise`\<[`ImageUploadResult`](../interfaces/ImageUploadResult.md)\>

A promise that resolves to the image upload result containing the URL and metadata.

## Example

```typescript
const handleImageUpload = async () => {
  if (openUploadImageModal) {
    const result = await openUploadImageModal();
    imageUrl.value = result.url;
    console.log('Image uploaded:', result);
  }
};
```
