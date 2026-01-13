[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / autoReportHeight

# Function: autoReportHeight()

> **autoReportHeight**(): () => `void`

Defined in: [packages/ui/src/zoid.ts:173](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/ed9f8db8759a780455b9f361423c35035a6f7ed1/packages/ui/src/zoid.ts#L173)

Automatically reports the height of the document body to the parent via zoid xprops.
This should be called in the child application (iframe).

## Returns

A cleanup function to stop observing height changes.

> (): `void`

### Returns

`void`
