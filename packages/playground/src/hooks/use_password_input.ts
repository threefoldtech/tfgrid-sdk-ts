import { computed, reactive, ref, VNodeRef } from "vue";

interface PasswordInputProps {
  type?: "text" | "password";
  "append-inner-icon"?: "mdi-eye-outline" | "mdi-eye-off-outline";
  "onClick:append-inner"?: () => boolean;
  ref?: (ref: VNodeRef | null) => void;
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
    ref: (el: VNodeRef | null) => {
      if (el && isComponentPublicInstance(el)) {
        const innerIcons = el.$el.querySelectorAll(".v-field__append-inner i");
        innerIcons.forEach(icon => icon.setAttribute("tabindex", "-1"));
      }
    },
  });
}

function isComponentPublicInstance(el: VNodeRef): el is VNodeRef & { $el: HTMLElement } {
  return typeof el === "object" && "$el" in el;
}
