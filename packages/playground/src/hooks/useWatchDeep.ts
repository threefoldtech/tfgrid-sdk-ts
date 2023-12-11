import debounce from "lodash/fp/debounce.js";
import equals from "lodash/fp/equals.js";
import { watch, type WatchCallback, type WatchOptions, type WatchSource } from "vue";

export function useWatchDeep<T, O extends boolean>(
  sources: WatchSource<T>,
  cb: WatchCallback<T, T | undefined>,
  options?: WatchOptions<O> & { debounce?: number },
) {
  const callback = options && options.debounce ? debounce(options.debounce, cb) : cb;
  return watch(
    sources,
    (value, oldValue, onCleanup) => {
      if (!equals(value, oldValue)) {
        callback(value, oldValue, onCleanup);
      }
    },
    options,
  );
}
