# Samples / fixtures

Real, captured payloads for building a mock host when testing a slide type against
`@aha/standalone` without a live AhaSlides host.

| File | What it is |
| --- | --- |
| [`presentation.sample.json`](./presentation.sample.json) | A real `xprops.presentation` object from a presenter session (v1). Matches the [`PresentationProps`](../src/presentation.reference.ts) reference type and [DOCS.md Appendix A](../DOCS.md#appendix-a--the-presentation-object). |

## Use it to fake `window.xprops`

The SDK reads everything from `window.xprops`. In a test page or unit test, stub it with the
fixture before your slide code runs:

```js
import presentation from '@ahaslides-product/plugins-standalone/samples/presentation.sample.json' assert { type: 'json' };

// Minimal presenter host mock — enough for a slide to render without a real host.
window.xprops = {
  presentation,
  slide: { id: presentation.activeSlide, textColour: '#1c1528', slideType: 'multiple-choice' },
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
