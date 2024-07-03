import { type ComponentPublicInstance, computed, reactive, ref } from "vue";

export function usePasswordInput(defaultShow = false) {
  const show = ref(defaultShow);

  return reactive({
    type: computed(() => (show.value ? "text" : "password")),
    "append-inner-icon": computed(() => (show.value ? "mdi-eye-outline" : "mdi-eye-off-outline")),
    "onClick:append-inner": () => (show.value = !show.value),
    ref: (el: ComponentPublicInstance<{}> | null) => {
      if (el) {
        const innerIcons = el.$el.querySelectorAll(".v-field__append-inner i");
        innerIcons.forEach((icon: HTMLElement) => icon.setAttribute("tabindex", "-1"));
      }
    },
  });
}
