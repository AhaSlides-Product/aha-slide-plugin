[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / useColors

# Function: useColors()

> **useColors**(): `DeepReadonly`\<`Ref`\<`string`[]\>\>

Defined in: [colors.ts:11](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/72c4cc359af2d69a73177d6ceb2205686948025a/packages/ui/src/colors.ts#L11)

Returns a synchronized, read-only list of colors for the current slide.
The synchronization channel is dynamically scoped to the current `slideId` from the route.

## Returns

`DeepReadonly`\<`Ref`\<`string`[]\>\>

A read-only ref containing an array of color strings.
