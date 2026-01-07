/**
 * Represents a request message sent between windows.
 */
export interface RequestMessage<T = any> {
  id: string;
  type: string;
  payload: T;
}

/**
 * Represents a response message received from another window.
 */
export interface ResponseMessage<T = any> {
  id: string;
  payload?: T;
  error?: string;
  isResponse: true;
}

/**
 * Executes a request to another window (e.g., an iframe or parent) and waits for a corresponding response.
 * Uses an internal ID to match responses to requests and supports timeouts.
 * 
 * @template TResponse - The expected type of the response payload.
 * @template TRequest - The type of the request payload.
 * @param type - The unique type string identifier for this request.
 * @param payload - The data to send with the request.
 * @param targetWindow - The window to send the message to. Defaults to `window.parent`.
 * @param origin - The target origin for security. Defaults to `'*'`.
 * @param timeout - Maximum time to wait for a response in milliseconds. Defaults to `5000`.
 * @returns A promise that resolves with the response payload.
 */
export function execRequest<TResponse = any, TRequest = any>(
  type: string,
  payload: TRequest,
  targetWindow: Window = window.parent,
  origin: string = '*',
  timeout: number = 5000
): Promise<TResponse> {
  const id = Math.random().toString(36).substring(2, 15);

  return new Promise((resolve, reject) => {
    const handler = (event: MessageEvent) => {
      // Security check: if origin is specified, verify it.
      if (origin !== '*' && event.origin !== origin) return;

      const data = event.data as ResponseMessage<TResponse>;

      // Check if the message is a response to our request.
      if (data && typeof data === 'object' && data.isResponse === true && data.id === id) {
        window.removeEventListener('message', handler);
        clearTimeout(timer);

        if (data.error) {
          reject(new Error(data.error));
        } else {
          resolve(data.payload as TResponse);
        }
      }
    };

    window.addEventListener('message', handler);

    const timer = setTimeout(() => {
      window.removeEventListener('message', handler);
      reject(new Error(`Request of type "${type}" timed out after ${timeout}ms`));
    }, timeout);

    targetWindow.postMessage({ id, type, payload } as RequestMessage<TRequest>, origin);
  });
}
