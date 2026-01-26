[**@aha/ui**](../README.md)

***

[@aha/ui](../README.md) / execRequest

# Function: execRequest()

> **execRequest**\<`TResponse`, `TRequest`\>(`type`, `payload`, `targetWindow`, `origin`, `timeout`): `Promise`\<`TResponse`\>

Defined in: [packages/ui/src/iframe.ts:33](https://github.com/AhaSlides-Product/aha-slide-plugin/blob/403f83f2cd6eb475da8c8eab1790751e8bbb3484/packages/ui/src/iframe.ts#L33)

Executes a request to another window (e.g., an iframe or parent) and waits for a corresponding response.
Uses an internal ID to match responses to requests and supports timeouts.

## Type Parameters

### TResponse

`TResponse` = `any`

The expected type of the response payload.

### TRequest

`TRequest` = `any`

The type of the request payload.

## Parameters

### type

`string`

The unique type string identifier for this request.

### payload

`TRequest`

The data to send with the request.

### targetWindow

`Window` = `window.parent`

The window to send the message to. Defaults to `window.parent`.

### origin

`string` = `'*'`

The target origin for security. Defaults to `'*'`.

### timeout

`number` = `5000`

Maximum time to wait for a response in milliseconds. Defaults to `5000`.

## Returns

`Promise`\<`TResponse`\>

A promise that resolves with the response payload.
