[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / usePresenterPlugin

# Function: usePresenterPlugin()

> **usePresenterPlugin**(`options`): [`BaseSlidePluginReturn`](../interfaces/BaseSlidePluginReturn.md) & `object`

Defined in: [packages/ui/src/zoid/presenter.ts:126](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/68e242b1a3734c506525f815fb958e13c2f7e87c/packages/ui/src/zoid/presenter.ts#L126)

Hook for Presenter Plugins (Canvas, Settings).
Provides access to presentation and slide data, as well as actions to manage slide attributes.

## Parameters

### options

[`UseSlidePluginOptions`](../interfaces/UseSlidePluginOptions.md) = `...`

Configure hook behavior (e.g., disable auto-height).

## Returns

[`BaseSlidePluginReturn`](../interfaces/BaseSlidePluginReturn.md) & `object`

Reactive refs for presentation and slide props, and actions for slide attributes.
