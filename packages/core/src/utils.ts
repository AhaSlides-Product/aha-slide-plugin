/**
 * Limits the execution frequency of a function.
 *
 * @param func - The function to throttle.
 * @param wait - The throttling delay in milliseconds.
 * @returns A throttled version of the function.
 */
export function throttle<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  return function (...args: Parameters<T>) {
    lastArgs = args;
    if (!timeout) {
      func(...lastArgs);
      timeout = setTimeout(() => {
        timeout = null;
      }, wait);
    }
  };
}
