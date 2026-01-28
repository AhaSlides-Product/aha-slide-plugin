[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / autoReportHeight

# Function: autoReportHeight()

> **autoReportHeight**(): () => `void`

Defined in: [packages/ui/src/zoid/base.ts:150](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/68e242b1a3734c506525f815fb958e13c2f7e87c/packages/ui/src/zoid/base.ts#L150)

Automatically reports the height of the document body to the parent via zoid xprops.
This should be called in the child application (iframe).

## Returns

A cleanup function to stop observing height changes.

> (): `void`

### Returns

`void`
