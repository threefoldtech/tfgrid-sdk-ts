<template>
  <slot></slot>
</template>

<script lang="ts" setup>
import { computed, provide, ref, watch } from "vue";

defineProps<{ modelValue?: boolean }>();
const emits = defineEmits<{ (events: "update:modelValue", value: boolean): void }>();

const inputsValidation = ref<{ [uid: number]: boolean }>({});
const inputsReset = {} as { [uid: number]: () => void };
const valid = computed(() => {
  return Object.values(inputsValidation.value).reduce((v, c) => {
    return v && c;
  }, true);
});
const invalid = computed(() => !valid.value);

watch(
  valid,
  v => {
    emits("update:modelValue", v);
  },
  { immediate: true },
);

function setValid(uid: number, value: boolean, reset: () => void): void {
  inputsValidation.value[uid] = value;
  inputsReset[uid] = reset;
}

function unregister(uid: number): void {
  delete inputsValidation.value[uid];
  delete inputsReset[uid];
}

provide("form:validator", {
  setValid,
  unregister,
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
defineExpose({
  reset() {
    Object.values(inputsReset).forEach(fn => fn());
  },
  valid,
  invalid,
});
</script>

<script lang="ts">
export default {
  name: "FormValidator",
};
</script>
