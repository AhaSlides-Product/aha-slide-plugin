# State Synchronization

The `@aha/ui` package provides utilities to synchronize state across different browser tabs or windows using the BroadcastChannel API. This is particularly useful for keeping data in sync between different views (e.g., Presenter and Audience views) open in the same browser.

## `useSync`

Creates a bidirectional synchronization channel. Changes made in one tab are broadcast to all other tabs listening on the same channel name.

### Usage

```typescript
import { useSync } from '@aha/ui';

// 'my-feature-state' is the unique channel name
// { isActive: false } is the initial state
const state = useSync('my-feature-state', { isActive: false });

// Updating this ref will broadcast the new value to other tabs
state.value.isActive = true;
```

### Parameters

*   `name` (string | Ref<string>): The unique name of the synchronization channel.
*   `initialState` (T): The initial value of the state.

### Returns

*   `Ref<T>`: A writable reactive reference that stays in sync.

---

## `useSyncReadOnly`

Creates a unidirectional synchronization listener. It updates the local state when messages are received but does **not** broadcast local changes.

### Usage

```typescript
import { useSyncReadOnly } from '@aha/ui';

const state = useSyncReadOnly('my-feature-state', { isActive: false });

// state.value will update when other tabs broadcast changes
// You cannot modify state.value directly as it is readonly
console.log(state.value.isActive);
```

### Parameters

*   `name` (string | Ref<string>): The unique name of the synchronization channel.
*   `initialState` (T): The initial value of the state.

### Returns

*   `DeepReadonly<Ref<T>>`: A read-only reactive reference.
