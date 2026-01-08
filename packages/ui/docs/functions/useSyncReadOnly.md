[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / useSyncReadOnly

# Function: useSyncReadOnly()

> **useSyncReadOnly**\<`T`\>(`name`, `initialState`): `DeepReadonly`\<`Ref`\<`T`\>\>

Defined in: [sync.ts:42](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/b516bbb35467388e4b68bced29d5297db9320de0/packages/ui/src/sync.ts#L42)

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
