[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / useBaseSlidePlugin

# Function: useBaseSlidePlugin()

> **useBaseSlidePlugin**(`options`, `onPropsExtension?`): [`BaseSlidePluginReturn`](../interfaces/BaseSlidePluginReturn.md) & `object`

Defined in: [packages/ui/src/zoid/base.ts:252](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/7a5cd0cf313da47e6a844ced4db8487ff81b2936/packages/ui/src/zoid/base.ts#L252)

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
