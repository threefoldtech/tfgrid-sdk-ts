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
  onAfterTask?(task: TaskResult<T, E, A>, beforeTaskReturn: any): any;
  onBeforeTask?(): any;
  onReset?(): any;
  shouldRun?(): boolean | Promise<boolean>;
  tries?: number;
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
    onReset: options.onReset || noop,
    shouldRun: options.shouldRun || (() => true),
    tries: typeof options.tries !== "number" ? 3 : Math.max(1, options.tries),
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
    const isLoading = loading.value;

    return {
      run,
      data: init && !isLoading ? data.value : _options.default,
      error: init && !isLoading ? error.value : null,
      loading: init ? isLoading : false,
      initialized: init,
      reset,
    };
  });

  async function run(...args: A): Promise<void> {
    if (!(await _options.shouldRun())) {
      initialized.value = false;
      return;
    }

    initialized.value = true;
    const ret = await _options.onBeforeTask();
    const taskId = ++taskIdCounter;
    loading.value = true;

    for (let i = 0; i < _options.tries; i++) {
      if (taskId !== taskIdCounter) {
        return;
      }

      if (await __run(args, taskId)) {
        break;
      }
    }

    if (taskId === taskIdCounter) {
      loading.value = false;
      _options.onAfterTask(asyncTask.value, ret);
    }
  }

  async function __run(args: A, taskId: number): Promise<boolean> {
    try {
      const res = await task(...args);
      if (taskId === taskIdCounter) {
        data.value = res;
        error.value = null;
      }
      return true;
    } catch (err) {
      if (taskId === taskIdCounter) {
        data.value = _options.default;
        error.value = err as E;
      }
      return false;
    }
  }

  function reset() {
    initialized.value = false;
    data.value = _options.default;
    error.value = null;
    loading.value = false;
    _options.onReset();
  }

  if (_options.init) {
    onMounted(() => run(..._options.defaultArgs));
  }

  return asyncTask;
}
