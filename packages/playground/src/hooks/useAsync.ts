import noop from "lodash/fp/noop.js";
import { computed, type ComputedRef, onMounted, type Ref, ref } from "vue";

export type AsyncTask<T, A extends any[]> = (...args: A) => Promise<T>;
export interface TaskResult<T, E, A extends any[]> {
  run(...args: A): Promise<void>;
  loading: boolean;
  data: T | null;
  error: E | null;
  initialized: boolean;
  reset(): void;
}

export type UseAsyncReturn<T, E, A extends any[]> = ComputedRef<TaskResult<T, E, A>>;

export type AsyncTaskOptions<T, E, A extends any[]> = {
  init?: boolean;
  defaultArgs?: A;
  default?: T;
  onAfterTask?(task: TaskResult<T, E, A>, beforeTaskReturn: any): void;
  onBeforeTask?(): any;
};
function normalizeOptions<T, E, A extends any[]>(
  options: AsyncTaskOptions<T, E, A> = {},
): Required<AsyncTaskOptions<T, E, A>> {
  return {
    init: options.init ?? false,
    defaultArgs: options.defaultArgs ?? ([] as unknown as A),
    default: options.default || (null as T),
    onAfterTask: options.onAfterTask || noop,
    onBeforeTask: options.onBeforeTask || noop,
  };
}

/* Tries, debounce */

export function useAsync<T, E = Error, A extends any[] = []>(
  task: AsyncTask<T, A>,
  options?: AsyncTaskOptions<T, E, A>,
): UseAsyncReturn<T, E, A> {
  const _options = normalizeOptions(options);

  const data = ref(_options.default) as Ref<T | null>;
  const error = ref(null) as Ref<E | null>;
  const loading = ref(false) as Ref<boolean>;
  const initialized = ref(false) as Ref<boolean>;

  let taskIdCounter = 0;

  const asyncTask = computed(() => {
    const init = initialized.value;

    return {
      run,
      data: init ? data.value : _options.default,
      error: init ? error.value : null,
      loading: init ? loading.value : false,
      initialized: init,
      reset,
    };
  });

  async function run(...args: A) {
    initialized.value = true;
    const taskId = ++taskIdCounter;
    loading.value = true;
    error.value = null;
    data.value = _options.default;
    const ret = _options.onBeforeTask();

    try {
      const res = await task(...args);
      if (taskId === taskIdCounter) {
        data.value = res;
      }
    } catch (err) {
      if (taskId === taskIdCounter) {
        data.value = _options.default;
        error.value = err as E;
      }
    } finally {
      if (taskId === taskIdCounter) {
        loading.value = false;
        _options.onAfterTask(asyncTask.value, ret);
      }
    }
  }

  function reset() {
    initialized.value = false;
  }

  if (_options.init) {
    onMounted(() => run(..._options.defaultArgs));
  }

  return asyncTask;
}
