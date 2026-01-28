[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / useSyncReadOnly

# Function: useSyncReadOnly()

> **useSyncReadOnly**\<`T`\>(`name`, `initialState`): `DeepReadonly`\<`Ref`\<`T`\>\>

Defined in: [packages/ui/src/sync.ts:69](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/084fa1a64aab79408b40af8fe107c55abe7287fa/packages/ui/src/sync.ts#L69)

Synchronize a state from other tabs, but do not broadcast local changes.

## Type Parameters

### T

`T`

The type of the state being synchronized.

## Parameters

### name

The unique name of the synchronization channel.

`string` | `Ref`\<`any`, `any`\>

### initialState

`T`

The initial value of the state.

## Returns

`DeepReadonly`\<`Ref`\<`T`\>\>

A read-only reactive ref.
