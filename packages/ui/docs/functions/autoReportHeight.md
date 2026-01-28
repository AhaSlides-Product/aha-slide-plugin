[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / autoReportHeight

# Function: autoReportHeight()

> **autoReportHeight**(): () => `void`

Defined in: [packages/ui/src/zoid/base.ts:150](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/084fa1a64aab79408b40af8fe107c55abe7287fa/packages/ui/src/zoid/base.ts#L150)

Automatically reports the height of the document body to the parent via zoid xprops.
This should be called in the child application (iframe).

## Returns

A cleanup function to stop observing height changes.

> (): `void`

### Returns

`void`
