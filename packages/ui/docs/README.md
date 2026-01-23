**@aha/ui**

***

# @aha/ui

## UI Components
- Each plugin should use ant-design-vue for reusable components. We already configured the design tokens to match our branding identity. 
- We exported the ThemeConfig for the ant-design-vue in @aha/ui. See apps/sample-slide/frontend/src/App.vue for example.
- The design tokens are avaiable as CSS variables in @aha/ui/ahaslides-vars.css

## Interfaces

- [AudienceSlidePluginProps](interfaces/AudienceSlidePluginProps.md)
- [ImageUploadResult](interfaces/ImageUploadResult.md)
- [RequestMessage](interfaces/RequestMessage.md)
- [ResponseMessage](interfaces/ResponseMessage.md)
- [SlidePluginProps](interfaces/SlidePluginProps.md)
- [TrackingElement](interfaces/TrackingElement.md)
- [UseSlidePluginOptions](interfaces/UseSlidePluginOptions.md)

## Variables

- [ahaSlidesDefaultTheme](variables/ahaSlidesDefaultTheme.md)
- [AudienceSlidePluginIframe](variables/AudienceSlidePluginIframe.md)
- [PresenterSlidePluginIframe](variables/PresenterSlidePluginIframe.md)
- [vEmitAction](variables/vEmitAction.md)

## Functions

- [autoReportHeight](functions/autoReportHeight.md)
- [execRequest](functions/execRequest.md)
- [uploadImage](functions/uploadImage.md)
- [useAudiencePlugin](functions/useAudiencePlugin.md)
- [useColors](functions/useColors.md)
- [usePresenterPlugin](functions/usePresenterPlugin.md)
- [useSync](functions/useSync.md)
- [useSyncReadOnly](functions/useSyncReadOnly.md)
