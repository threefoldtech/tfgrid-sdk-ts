import noop from "lodash/fp/noop.js";
import { computed, type ComputedRef, onMounted, type Ref, ref } from "vue";

export type AsyncTask<T, A extends any[]> = (...args: A) => Promise<T>;
export interface TaskResult<T, E, A extends any[], M = T> {
  run(...args: A): Promise<void>;
  loading: boolean;
  data: M | null;
  error: E | null;
  initialized: boolean;
  reset(): void;
  startPolling(): void;
  stopPolling(): void;
  isPolling: boolean;
}

export type UseAsyncReturn<T, E, A extends any[], M = T> = ComputedRef<TaskResult<T, E, A, M>>;

export type AsyncTaskOptions<T, E, A extends any[], M = T> = {
  init?: boolean;
  defaultArgs?: A;
  default?: M;
  onAfterTask?(task: TaskResult<T, E, A, M>, beforeTaskReturn: any): any;
  onBeforeTask?(): any;
  onReset?(): any;
  shouldRun?(): boolean | Promise<boolean>;
  tries?: number;
  pollingTime?: number;
  map?(data: T): M;
};

function normalizeOptions<T, E, A extends any[], M = T>(
  options: AsyncTaskOptions<T, E, A, M> = {},
): Required<AsyncTaskOptions<T, E, A, M>> {
  return {
    init: options.init ?? false,
    defaultArgs: options.defaultArgs ?? ([] as unknown as A),
    default: options.default || (null as M),
    onAfterTask: options.onAfterTask || noop,
    onBeforeTask: options.onBeforeTask || noop,
    onReset: options.onReset || noop,
    shouldRun: options.shouldRun || (() => true),
    tries: typeof options.tries !== "number" ? 3 : Math.max(1, options.tries),
    pollingTime: options.pollingTime || 0,
    map: options.map || (d => d as unknown as M),
  };
}

/* Tries, debounce */

export function useAsync<T, E = Error, A extends any[] = [], M = T>(
  task: AsyncTask<T, A>,
  options?: AsyncTaskOptions<T, E, A, M>,
): UseAsyncReturn<T, E, A, M> {
  const _options = normalizeOptions(options);

  const data = ref(_options.default) as Ref<M | null>;
  const error = ref(null) as Ref<E | null>;
  const loading = ref(false) as Ref<boolean>;
  const initialized = ref(false) as Ref<boolean>;
  const polling = ref<ReturnType<typeof setInterval>>();

  let taskIdCounter = 0;

  const asyncTask = computed(() => {
    const init = initialized.value;
    const isLoading = loading.value;

    const task: TaskResult<T, E, A, M> = {
      run,
      data: init && !isLoading ? data.value : _options.default,
      error: init && !isLoading ? error.value : null,
      loading: init ? isLoading : false,
      initialized: init,
      reset,
      startPolling,
      stopPolling,
      isPolling: init && polling.value ? !!polling.value : false,
    };

    return task;
  });

  function _assertPollingTime() {
    if (!_options.pollingTime) {
      throw new Error("Can't start polling without setting pollingtime");
    }
  }

  function startPolling() {
    _assertPollingTime();
    if (!polling.value) {
      run(..._options.defaultArgs);
      polling.value = setInterval(() => run(..._options.defaultArgs), _options.pollingTime);
    }
  }

  function stopPolling() {
    _assertPollingTime();
    if (polling.value) {
      clearInterval(polling.value);
      polling.value = undefined;
    }
  }

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
        data.value = _options.map(res);
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
    if (_options.pollingTime) {
      polling.value = setInterval(() => run(..._options.defaultArgs), _options.pollingTime);
    }
  }

  return asyncTask;
}
