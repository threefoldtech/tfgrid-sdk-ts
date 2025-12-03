import { onUnmounted } from "vue";

/**
 * Composable that provides an AbortController that automatically aborts on component unmount.
 * @returns AbortController signal
 */
export function useAbortController() {
  const abortController = new AbortController();

  onUnmounted(() => {
    abortController.abort();
  });

  return abortController.signal;
}

/**
 * Type guard to detect AbortError in catch blocks.
 */
export function isAbortError(error: unknown): error is Error {
  return error instanceof Error && error.name === "AbortError";
}

/**
 * Composable that wraps fetch calls with automatic abort signal.
 * Reduces boilerplate by automatically injecting signal.
 */
export function useFetch() {
  const signal = useAbortController();

  return async (url: string, options?: RequestInit) => {
    return fetch(url, { ...options, signal });
  };
}

/**
 * Composable that wraps API utility functions with automatic abort signal.
 * Automatically appends abort signal as the last parameter.
 * Creates a fresh signal for each component instance that aborts on unmount.
 *
 * Usage:
 * - const getNodesWithSignal = useWithAbortSignal(requestNodes);
 * - const listWithSignal = useWithAbortSignal((q, opts) => gridProxyClient.nodes.list(q, opts));
 */
export function useWithAbortSignal<T extends (...args: any[]) => Promise<any>>(
  fn: T,
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  // Get the signal that will be aborted when component unmounts
  // This creates a NEW signal each time setup() runs (on each mount)
  const signal = useAbortController();

  return async (...args: Parameters<T>) => {
    // Check if signal is already aborted (component unmounted)
    if (signal.aborted) {
      const error = new Error("Request aborted");
      error.name = "AbortError";
      throw error;
    }

    // Check if last argument is already an AbortSignal
    const lastArg = args[args.length - 1];
    if (lastArg instanceof AbortSignal) {
      return fn(...args);
    }
    // Append signal as last parameter
    return fn(...args, signal as any);
  };
}
