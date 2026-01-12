[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / useSyncReadOnly

# Function: useSyncReadOnly()

> **useSyncReadOnly**\<`T`\>(`name`, `initialState`): `DeepReadonly`\<`Ref`\<`T`\>\>

Defined in: [packages/ui/src/sync.ts:42](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/39439237c366309fa5f1d8b1c51b57a305f27d27/packages/ui/src/sync.ts#L42)

Synchronize a state from other tabs, but do not broadcast local changes.
This is useful for listeners that should only react to remote updates.

## Type Parameters

### T

`T`

The type of the state being synchronized.

## Parameters

### name

`string`

The unique name of the synchronization channel.

### initialState

`T`

The initial value of the state.

## Returns

`DeepReadonly`\<`Ref`\<`T`\>\>

A read-only reactive ref.
