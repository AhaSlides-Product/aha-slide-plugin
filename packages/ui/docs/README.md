**@aha/ui**

***

# @aha/ui

## Interfaces

- [AudienceSlidePluginProps](interfaces/AudienceSlidePluginProps.md)
- [BaseSlidePluginProps](interfaces/BaseSlidePluginProps.md)
- [BaseSlidePluginReturn](interfaces/BaseSlidePluginReturn.md)
- [ImageUploadResult](interfaces/ImageUploadResult.md)
- [PluginKeyboardEvent](interfaces/PluginKeyboardEvent.md)
- [ReportProps](interfaces/ReportProps.md)
- [ReportReturn](interfaces/ReportReturn.md)
- [SlidePluginProps](interfaces/SlidePluginProps.md)
- [TrackingElement](interfaces/TrackingElement.md)
- [UseSlidePluginOptions](interfaces/UseSlidePluginOptions.md)

## Type Aliases

- [PresenterPluginReturn](type-aliases/PresenterPluginReturn.md)

## Variables

- [ahaSlidesDefaultTheme](variables/ahaSlidesDefaultTheme.md)
- [AudienceSlidePluginIframe](variables/AudienceSlidePluginIframe.md)
- [emitActionDirective](variables/emitActionDirective.md)
- [emitActionPlugin](variables/emitActionPlugin.md)
- [PresenterSlidePluginIframe](variables/PresenterSlidePluginIframe.md)
- [ReportIframe](variables/ReportIframe.md)
- [vEmitAction](variables/vEmitAction.md)

## Functions

- [autoReportHeight](functions/autoReportHeight.md)
- [uploadImage](functions/uploadImage.md)
- [useAudiencePlugin](functions/useAudiencePlugin.md)
- [useBaseSlidePlugin](functions/useBaseSlidePlugin.md)
- [usePresenterPlugin](functions/usePresenterPlugin.md)
- [useReportPlugin](functions/useReportPlugin.md)
- [useSync](functions/useSync.md)
- [useSyncReadOnly](functions/useSyncReadOnly.md)

## Mixpanel tracking
1. Register the plugin in your app entry point (i.e. `main.ts` file):
```typescript
import { emitActionPlugin } from '@aha/ui';

app.use(emitActionPlugin);
```
2. Add a `name` attribute to the element that users interact with. This name should be as much specific as possible to avoid naming collisions in the Mixpanel reports.

3. Use the directive in your templates:
```html
<a-button v-aha-emit-action name='idea-board-group-voting-button' @click="clickHandler">
  Vote
</a-button>
```
