import { computed, reactive, type Ref, ref } from "vue";

export interface UsePasswordInputOptions {
  ref?: Ref | null;
  show?: boolean;
}

export function usePasswordInput(options?: UsePasswordInputOptions) {
  const _options: Required<UsePasswordInputOptions> = {
    show: options?.show ?? false,
    ref: options?.ref ?? null,
  };

  const show = ref(options?.show ?? false);

  function setRef(el: any): void {
    if (_options.ref) {
      _options.ref.value = el;
    }
  }

  return reactive({
    ref: setRef,
    type: computed(() => (show.value ? "text" : "password")),
    "append-inner-icon": computed(() => (show.value ? "mdi-eye-outline" : "mdi-eye-off-outline")),
    "onClick:append-inner": () => (show.value = !show.value),
  });
}
