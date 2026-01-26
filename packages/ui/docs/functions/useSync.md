[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / useSync

# Function: useSync()

> **useSync**\<`T`\>(`name`, `initialState`): `Ref`\<`T`\>

Defined in: [packages/ui/src/sync.ts:11](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/403f83f2cd6eb475da8c8eab1790751e8bbb3484/packages/ui/src/sync.ts#L11)

Synchronize a reactive state ref across multiple browser tabs bidirectionally.

## Type Parameters

### T

`T`

The type of the state being synchronized.

## Parameters

### name

The unique name of the synchronization channel (can be a Ref or string).

`string` | `Ref`\<`any`, `any`\>

### initialState

`T`

The initial value of the state.

## Returns

`Ref`\<`T`\>

A reactive ref that stays in sync across tabs.
