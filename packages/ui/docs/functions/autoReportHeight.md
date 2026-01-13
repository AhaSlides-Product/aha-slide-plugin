[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / autoReportHeight

# Function: autoReportHeight()

> **autoReportHeight**(): () => `void`

Defined in: [packages/ui/src/zoid.ts:165](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/d0b17028ef558ec827f47f763e73d18be6e2a14e/packages/ui/src/zoid.ts#L165)

Automatically reports the height of the document body to the parent via zoid xprops.
This should be called in the child application (iframe).

## Returns

A cleanup function to stop observing height changes.

> (): `void`

### Returns

`void`
