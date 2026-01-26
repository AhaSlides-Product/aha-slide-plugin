[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / autoReportHeight

# Function: autoReportHeight()

> **autoReportHeight**(): () => `void`

Defined in: [packages/ui/src/zoid.ts:368](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/bf5daf7f9bcfd4441ec675a1339242de93661955/packages/ui/src/zoid.ts#L368)

Automatically reports the height of the document body to the parent via zoid xprops.
This should be called in the child application (iframe).

## Returns

A cleanup function to stop observing height changes.

> (): `void`

### Returns

`void`
