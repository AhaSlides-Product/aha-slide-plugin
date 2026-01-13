[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / useSync

# Function: useSync()

> **useSync**\<`T`\>(`name`, `initialState`): `Ref`\<`T`\>

Defined in: [packages/ui/src/sync.ts:13](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/cd9b05f8dbb05e4870c0cb2cf0990c50f3d011fa/packages/ui/src/sync.ts#L13)

Synchronize a reactive state ref across multiple browser tabs bidirectionally.
Uses the BroadcastChannel API under the hood via VueUse.

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

`Ref`\<`T`\>

A reactive ref that stays in sync across tabs.
