[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / usePresenterPlugin

# Function: usePresenterPlugin()

> **usePresenterPlugin**(`options`): [`PresenterPluginReturn`](../type-aliases/PresenterPluginReturn.md)

Defined in: [packages/ui/src/zoid/presenter.ts:205](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/924cf70c3514213c6fa8e9f8a90e3dcc697a9b79/packages/ui/src/zoid/presenter.ts#L205)

Hook for Presenter Plugins (Canvas, Settings).
Provides access to presentation and slide data, as well as actions to manage slide attributes.

## Parameters

### options

[`UseSlidePluginOptions`](../interfaces/UseSlidePluginOptions.md) = `...`

Configure hook behavior (e.g., disable auto-height).

## Returns

[`PresenterPluginReturn`](../type-aliases/PresenterPluginReturn.md)

Reactive refs for presentation and slide props, and actions for slide attributes.
