[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / openEditImageModal

# Function: openEditImageModal()

> **openEditImageModal**(`currentImageUrl`): `Promise`\<[`ImageUploadResult`](../interfaces/ImageUploadResult.md)\>

Defined in: [packages/ui/src/zoid.ts:470](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/403f83f2cd6eb475da8c8eab1790751e8bbb3484/packages/ui/src/zoid.ts#L470)

Opens a modal in the parent application that allows the user to edit an existing image.
The modal provides image editing capabilities and returns the edited image result.

## Parameters

### currentImageUrl

`string`

The URL of the current image to be edited.

## Returns

`Promise`\<[`ImageUploadResult`](../interfaces/ImageUploadResult.md)\>

A promise that resolves to the edited image upload result containing the new URL and metadata.

## Example

```typescript
const handleEditImage = async () => {
  if (openEditImageModal && imageUrl.value) {
    const result = await openEditImageModal(imageUrl.value);
    imageUrl.value = result.url;
    console.log('Image edited successfully:', result);
  }
};
```
