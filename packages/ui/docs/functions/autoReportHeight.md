[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / autoReportHeight

# Function: autoReportHeight()

> **autoReportHeight**(): () => `void`

Defined in: [packages/ui/src/zoid.ts:392](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/3f307ee201e0da6c14fae0bf8233f474547111f3/packages/ui/src/zoid.ts#L392)

Automatically reports the height of the document body to the parent via zoid xprops.
This should be called in the child application (iframe).

## Returns

A cleanup function to stop observing height changes.

> (): `void`

### Returns

`void`
