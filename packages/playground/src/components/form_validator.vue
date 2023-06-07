<template>
  <slot></slot>
</template>

<script lang="ts" setup>
import { computed, provide, ref, watch } from "vue";

import { ValidatorStatus } from "./input_validator.vue";

defineProps<{ modelValue?: boolean }>();
const emits = defineEmits<{ (events: "update:modelValue", value: boolean): void }>();

const inputsValidation = ref<{ [uid: number]: ValidatorStatus }>({});
const inputsReset = {} as { [uid: number]: () => void };
const valid = computed(() => Object.values(inputsValidation.value).every(c => c === ValidatorStatus.VALID));
const invalid = computed(() => !valid.value);
const pending = computed(() => {
  return Object.values(inputsValidation.value).some(c => c === ValidatorStatus.PENDING);
});

watch(
  valid,
  v => {
    emits("update:modelValue", v);
  },
  { immediate: true },
);

function setStatus(uid: number, value: ValidatorStatus): void {
  inputsValidation.value[uid] = value;
}

function unregister(uid: number): void {
  delete inputsValidation.value[uid];
  delete inputsReset[uid];
}

provide("form:validator", {
  setStatus,
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
export default {
  name: "FormValidator",
};
</script>
