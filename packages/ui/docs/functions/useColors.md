[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / useColors

# Function: useColors()

> **useColors**(): `DeepReadonly`\<`Ref`\<`string`[]\>\>

Defined in: [packages/ui/src/colors.ts:11](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/403f83f2cd6eb475da8c8eab1790751e8bbb3484/packages/ui/src/colors.ts#L11)

Returns a synchronized, read-only list of colors for the current slide.
The synchronization channel is dynamically scoped to the current `slideId` from the route.

## Returns

`DeepReadonly`\<`Ref`\<`string`[]\>\>

A read-only ref containing an array of color strings.
