export interface RequestMessage<T = any> {
  id: string;
  type: string;
  payload: T;
}

export interface ResponseMessage<T = any> {
  id: string;
  payload?: T;
  error?: string;
}

/**
 * Executes a request to another window (e.g., an iframe or parent) and waits for a response.
 * 
 * @param targetWindow The window to send the message to.
 * @param type The type of the request.
 * @param payload The data to send.
 * @param origin The target origin. Defaults to '*'.
 * @param timeout Timeout in milliseconds. Defaults to 5000.
 * @returns A promise that resolves with the response payload or rejects on error/timeout.
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
      if (data && typeof data === 'object' && data.id === id) {
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
