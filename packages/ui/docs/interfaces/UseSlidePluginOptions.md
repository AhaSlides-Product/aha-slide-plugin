[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / UseSlidePluginOptions

# Interface: UseSlidePluginOptions

Defined in: [packages/ui/src/zoid.ts:115](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/39439237c366309fa5f1d8b1c51b57a305f27d27/packages/ui/src/zoid.ts#L115)

Options for the useSlidePlugin hook.

## Properties

### autoHeight?

> `optional` **autoHeight**: `boolean`

Defined in: [packages/ui/src/zoid.ts:121](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/39439237c366309fa5f1d8b1c51b57a305f27d27/packages/ui/src/zoid.ts#L121)

Whether to automatically report content height to the parent.
- If true (default): Child measures its height and tells the parent to resize.
- If false: Child tells the parent to use 100% height.
