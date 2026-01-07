[**@aha/dev**](../README.md)

***

[@aha/dev](../README.md) / initDev

# Function: initDev()

> **initDev**(): `void`

Defined in: [index.ts:71](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/72c4cc359af2d69a73177d6ceb2205686948025a/packages/dev/src/index.ts#L71)

Initializes the development mode polyfill.
Intercepts `window.postMessage` requests and provides responses by calling the real Dev API.
This should only be used during local development and is typically gated by an environment variable.

## Returns

`void`
