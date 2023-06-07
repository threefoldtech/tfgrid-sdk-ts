<template>
  <slot></slot>
</template>

<script lang="ts" setup>
import { computed, provide, ref, watch } from "vue";

defineProps<{ modelValue?: boolean }>();
const emits = defineEmits<{ (events: "update:modelValue", value: boolean): void }>();

const inputsValidation = ref<{ [uid: number]: boolean }>({});
const inputsReset = {} as { [uid: number]: () => void };
const pendingStatus = ref<boolean>();
const valid = computed(() => {
  return Object.values(inputsValidation.value).reduce((v, c) => {
    return v && c;
  }, true);
});
const invalid = computed(() => !valid.value);
const pending = computed(() => pendingStatus.value === !!ValidatorStatus.PENDING);

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

function setPending(value: boolean, reset: () => void): void {
  pendingStatus.value = value;
}

function unregister(uid: number): void {
  delete inputsValidation.value[uid];
  delete inputsReset[uid];
}

provide("form:validator", {
  setValid,
  setPending,
  unregister,
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
defineExpose({
  reset() {
    Object.values(inputsReset).forEach(fn => fn());
  },
  valid,
  invalid,
  pending,
});
</script>

<script lang="ts">
import { ValidatorStatus } from "./input_validator.vue";

export default {
  name: "FormValidator",
};
</script>
