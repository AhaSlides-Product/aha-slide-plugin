[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / emitActionPlugin

# Variable: emitActionPlugin

> `const` **emitActionPlugin**: `Plugin`

Defined in: [packages/ui/src/tracking.ts:261](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d91fbb66824f17fb34de92a758af66be8664842a/packages/ui/src/tracking.ts#L261)

Vue 3 Plugin to register the emit-action directive

Usage in main.ts:
  import emitActionPlugin from '@/directives/emit-action.plugin'
  app.use(emitActionPlugin)

Then use in components:
  <button v-aha-emit-action>Click me</button>
