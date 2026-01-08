[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / vEmitAction

# Variable: vEmitAction

> `const` **vEmitAction**: `ObjectDirective`\<`TrackingElement`, `any`\>

Defined in: tracking.ts:20

A Vue directive to track click actions and emit them to the parent window.
It attaches a click event listener to the element and sends the binding value
as a 'track-action' message via postMessage.

## Example

```html
<button v-emit-action="{ category: 'ui', action: 'click', label: 'submit' }">
  Submit
</button>
```
