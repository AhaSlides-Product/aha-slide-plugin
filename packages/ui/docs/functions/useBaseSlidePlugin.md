[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / useBaseSlidePlugin

# Function: useBaseSlidePlugin()

> **useBaseSlidePlugin**(`options`, `onPropsExtension?`): [`BaseSlidePluginReturn`](../interfaces/BaseSlidePluginReturn.md) & `object`

Defined in: [packages/ui/src/zoid/base.ts:276](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/base.ts#L276)

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
