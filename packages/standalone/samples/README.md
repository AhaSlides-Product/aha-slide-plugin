# Samples / fixtures

Real, captured payloads for building a mock host when testing a slide type against
`@aha/standalone` without a live AhaSlides host.

| File | What it is |
| --- | --- |
| [`presentation.sample.json`](./presentation.sample.json) | A real `xprops.presentation` object from a presenter session (v1). Matches [`PresentationProps`](../src/presentation.reference.ts) and [DOCS.md Appendix A](../DOCS.md#appendix-a--the-presentation-object). |
| [`slide.sample.json`](./slide.sample.json) | A real `xprops.slide` object (a quiz slide, v1). Matches [`SlideProps`](../src/slide.reference.ts) and [DOCS.md Appendix B](../DOCS.md#appendix-b--the-slide-object). |

## Use it to fake `window.xprops`

The SDK reads everything from `window.xprops`. In a test page or unit test, stub it with the
fixture before your slide code runs:

```js
import presentation from '@ahaslides-product/plugins-standalone/samples/presentation.sample.json' assert { type: 'json' };
import slide from '@ahaslides-product/plugins-standalone/samples/slide.sample.json' assert { type: 'json' };

// Minimal presenter host mock — enough for a slide to render without a real host.
window.xprops = {
  presentation,
  slide,
  presentationColorPalette: ['#6A1EBB', '#E6007E', '#28C270', '#7669BF'],
  presentationLighterColorPalette: ['#efe6fb', '#fce4f0', '#dff4ef', '#eae7f6'],
  baseUrl: '',
  onHeightChange() {},
  showToastSuccess() {},
  sendVoteOutcome() {},
  setActionButtons() {},
  onActionInvoke() {},
  getSlideAttributesAction: async () => ({}),
};
```

For a plain `<script src>` page, assign the same object literally (paste the JSON inline or
`fetch()` the file) before loading the slide's script.

> These are static snapshots for development only — never ship them as production data. Field
> values (ids, codes, timestamps) are illustrative.
