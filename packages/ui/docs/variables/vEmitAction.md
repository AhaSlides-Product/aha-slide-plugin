[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / vEmitAction

# Variable: vEmitAction

> `const` **vEmitAction**: `ObjectDirective`\<[`TrackingElement`](../interfaces/TrackingElement.md), `any`\>

Defined in: [packages/ui/src/tracking.ts:20](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/403f83f2cd6eb475da8c8eab1790751e8bbb3484/packages/ui/src/tracking.ts#L20)

A Vue directive to track click actions and emit them to the parent window.
It attaches a click event listener to the element and sends the binding value
via zoid prop `trackGA4AndMixpanel`.

## Example

```html
<button v-emit-action="{ category: 'ui', action: 'click', label: 'submit' }">
  Submit
</button>
```
