[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / useSync

# Function: useSync()

> **useSync**\<`T`\>(`name`, `initialState`): `Ref`\<`T`\>

Defined in: [sync.ts:13](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/72c4cc359af2d69a73177d6ceb2205686948025a/packages/ui/src/sync.ts#L13)

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
