import { onUnmounted, type Ref, ref, watch } from "vue";

export function clearableRef<T>(defaultValue: T, timeout: number) {
  const valueRef = ref<T>(defaultValue) as Ref<T>;

  let timeoutRef: ReturnType<typeof setTimeout>;

  onUnmounted(clear);
  function clear() {
    timeoutRef && clearTimeout(timeoutRef);
  }

  watch(valueRef, () => {
    if (timeoutRef) clearTimeout(timeoutRef);
    timeoutRef = setTimeout(() => (valueRef.value = defaultValue), timeout);
  });

  return valueRef;
}

export * from "./use_password_input";
