[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / useSyncReadOnly

# Function: useSyncReadOnly()

> **useSyncReadOnly**\<`T`\>(`name`, `initialState`): `DeepReadonly`\<`Ref`\<`T`\>\>

Defined in: [packages/ui/src/sync.ts:69](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/ba80983bd50ca063a1b9a1379ae08370d8394222/packages/ui/src/sync.ts#L69)

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
