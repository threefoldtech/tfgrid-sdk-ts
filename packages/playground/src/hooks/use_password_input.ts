import { computed, reactive, ref } from "vue";

interface PasswordInputProps {
  type: "text" | "password";
  "append-inner-icon"?: "mdi-eye-outline" | "mdi-eye-off-outline";
  "onClick:append-inner"?: () => boolean;
  ref?: (el: HTMLFormElement) => void;
  disabled?: boolean;
  label?: string;
  readonly?: boolean;
  modelValue?: string;
}

export function usePasswordInput(defaultShow = false): PasswordInputProps {
  const show = ref(defaultShow);

  return reactive({
    type: computed(() => (show.value ? "text" : "password")),
    "append-inner-icon": computed(() => (show.value ? "mdi-eye-outline" : "mdi-eye-off-outline")),
    "onClick:append-inner": () => (show.value = !show.value),
    ref: (el: HTMLFormElement) => {
      if (el) {
        const innerIcons = el.$el.querySelectorAll(".v-field__append-inner i");
        innerIcons.forEach((icon: HTMLElement) => icon.setAttribute("tabindex", "-1"));
      }
    },
  });
}
