import debounce from "lodash/fp/debounce.js";
import equals from "lodash/fp/equals.js";
import { watch, type WatchCallback, type WatchOptions, type WatchSource } from "vue";

export function useWatchDeep<T, O extends boolean>(
  sources: WatchSource<T>,
  cb: WatchCallback<T, T | undefined>,
  options?: WatchOptions<O> & { debounce?: number; ignoreFields?: Array<keyof T> },
) {
  const callback = options && options.debounce ? debounce(options.debounce, cb) : cb;

  const getValue = (value?: T) => {
    if (value && options && options.ignoreFields) {
      const _value = { ...value };
      for (const field of options.ignoreFields) {
        delete _value[field];
      }
      return _value;
    }
    return value;
  };

  return watch(
    sources,
    (value, oldValue, onCleanup) => {
      const _value = getValue(value);
      const _oldValue = getValue(oldValue);

      if (!equals(_value, _oldValue)) {
        callback(value, oldValue, onCleanup);
      }
    },
    options,
  );
}
