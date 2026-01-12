[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / SlidePluginIframe

# Variable: SlidePluginIframe

> `const` **SlidePluginIframe**: `any`

Defined in: [packages/ui/src/zoid.ts:53](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/39439237c366309fa5f1d8b1c51b57a305f27d27/packages/ui/src/zoid.ts#L53)

SlidePluginIframe is a cross-domain component (zoid) that allows
Ahaslides parent applications to communicate with plugin iframes.

## Example

```typescript
import { SlidePluginIframe } from '@aha/ui';

// Initializing the component
const instance = SlidePluginIframe({
  url: 'https://plugin.example.com',
  onHeightChange: (height) => {
    console.log('New height:', height);
  }
});

// Rendering to a container
instance.render('#zoid-container');
```
