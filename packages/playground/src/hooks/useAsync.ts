import type { ComputedRef, Ref } from "vue";
import { computed, onMounted, ref } from "vue";

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

export type AsyncTaskOptions<A extends any[]> = { init?: boolean; defaultArgs?: A };
function normalizeOptions<A extends any[]>(options: AsyncTaskOptions<A> = {}): Required<AsyncTaskOptions<A>> {
  return {
    init: options.init ?? false,
    defaultArgs: options.defaultArgs ?? ([] as unknown as A),
  };
}

/* Tries, debounce */

export function useAsync<T, E = Error, A extends any[] = []>(
  task: AsyncTask<T, A>,
  options?: AsyncTaskOptions<A>,
): UseAsyncReturn<T, E, A> {
  const _options = normalizeOptions(options);

  const data = ref(null) as Ref<T | null>;
  const error = ref(null) as Ref<E | null>;
  const loading = ref(false) as Ref<boolean>;
  const initialized = ref(false) as Ref<boolean>;

  let taskIdCounter = 0;

  async function run(...args: A) {
    initialized.value = true;
    const taskId = ++taskIdCounter;
    loading.value = true;
    error.value = null;
    data.value = null;

    try {
      const res = await task(...args);
      if (taskId === taskIdCounter) {
        data.value = res;
      }
    } catch (err) {
      if (taskId === taskIdCounter) {
        data.value = null;
        error.value = err as E;
      }
    } finally {
      if (taskId === taskIdCounter) {
        loading.value = false;
      }
    }
  }

  function reset() {
    data.value = null;
    error.value = null;
    loading.value = false;
    initialized.value = false;
  }

  if (_options.init) {
    onMounted(() => run(..._options.defaultArgs));
  }

  return computed(() => {
    return {
      run,
      data: data.value,
      error: error.value,
      loading: loading.value,
      initialized: initialized.value,
      reset,
    };
  });
}
