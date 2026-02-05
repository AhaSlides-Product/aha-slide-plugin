[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / emitActionPlugin

# Variable: emitActionPlugin

> `const` **emitActionPlugin**: `Plugin`

Defined in: [packages/ui/src/tracking.ts:261](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/7a5cd0cf313da47e6a844ced4db8487ff81b2936/packages/ui/src/tracking.ts#L261)

Vue 3 Plugin to register the emit-action directive

Usage in main.ts:
  import emitActionPlugin from '@/directives/emit-action.plugin'
  app.use(emitActionPlugin)

Then use in components:
  <button v-aha-emit-action>Click me</button>
