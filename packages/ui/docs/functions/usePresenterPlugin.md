[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / usePresenterPlugin

# Function: usePresenterPlugin()

> **usePresenterPlugin**(`options`): [`PresenterPluginReturn`](../type-aliases/PresenterPluginReturn.md)

Defined in: [packages/ui/src/zoid/presenter.ts:270](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/zoid/presenter.ts#L270)

Hook for Presenter Plugins (Canvas, Settings).
Provides access to presentation and slide data, as well as actions to manage slide attributes.

## Parameters

### options

[`UseSlidePluginOptions`](../interfaces/UseSlidePluginOptions.md) = `...`

Configure hook behavior (e.g., disable auto-height).

## Returns

[`PresenterPluginReturn`](../type-aliases/PresenterPluginReturn.md)

Reactive refs for presentation and slide props, and actions for slide attributes.
