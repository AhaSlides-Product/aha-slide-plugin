[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / useBaseSlidePlugin

# Function: useBaseSlidePlugin()

> **useBaseSlidePlugin**(`options`, `onPropsExtension?`): [`BaseSlidePluginReturn`](../interfaces/BaseSlidePluginReturn.md) & `object`

Defined in: [packages/ui/src/zoid/base.ts:252](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/924cf70c3514213c6fa8e9f8a90e3dcc697a9b79/packages/ui/src/zoid/base.ts#L252)

Base hook that provides common functionality for both presenter and audience plugins.

## Parameters

### options

[`UseSlidePluginOptions`](../interfaces/UseSlidePluginOptions.md) = `...`

Configure hook behavior (e.g., disable auto-height).

### onPropsExtension?

(`newProps`) => `void`

Optional callback to handle additional props updates.

## Returns

[`BaseSlidePluginReturn`](../interfaces/BaseSlidePluginReturn.md) & `object`

Reactive refs for common presentation and slide props, and shared actions.
