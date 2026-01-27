[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / uploadImage

# Function: uploadImage()

> **uploadImage**(`file`): `Promise`\<[`ImageUploadResult`](../interfaces/ImageUploadResult.md)\>

Defined in: [packages/ui/src/zoid.ts:468](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/403f83f2cd6eb475da8c8eab1790751e8bbb3484/packages/ui/src/zoid.ts#L468)

Programmatically uploads an image file to the parent application's hosting service.
This function accepts a File object (typically from an input or drag-and-drop event) and handles the upload process.

## Parameters

### file

`File`

The image file to upload. Must be a valid File object (Blob).

## Returns

`Promise`\<[`ImageUploadResult`](../interfaces/ImageUploadResult.md)\>

A promise that resolves to the image upload result containing the URL, path, and any additional metadata.

## Example

```typescript
// Using with Ant Design Upload component
const handleCustomUpload = async (options: any) => {
  const { file } = options;
  
  if (uploadImage) {
    const result = await uploadImage(file.originFileObj);
    imageUrl.value = result.url;
    console.log('Image uploaded successfully:', result);
  }
};
```
