<template>
  <slot
    :props="{
      onBlur: touched ? undefined : onBlur,
      errorMessages: touched ? errorMessage : undefined,
      error: touched && !!errorMessage,
      loading: inputStatus === ValidatorStatus.PENDING,
      hint,
      'persistent-hint': hintPersistent,
      class: inputStatus === ValidatorStatus.VALID ? 'is-valid-input' : undefined,
    }"
  ></slot>
</template>

<script lang="ts" setup>
import debounce from "lodash/debounce.js";
import { computed, getCurrentInstance, inject, onMounted, onUnmounted, type PropType, ref, watch } from "vue";

import type { FormValidatorService } from "../types";

export type RuleReturn = { message: string; [key: string]: any } | undefined | void;
export type SyncRule = (value: string) => RuleReturn;
export type AsyncRule = (value: string) => Promise<RuleReturn>;

const uid = getCurrentInstance()!.uid;

const props = defineProps({
  status: {
    type: String as PropType<ValidatorStatus>,
    required: false,
  },
  rules: {
    type: Array as PropType<SyncRule[]>,
    required: true,
  },
  asyncRules: {
    type: Array as PropType<AsyncRule[]>,
    required: false,
    default: [] as AsyncRule[],
  },
  value: {
    type: String as PropType<string | number | undefined>,
    required: true,
  },
  validMessage: {
    type: String,
    required: false,
  },
  immediate: {
    type: Boolean,
    required: false,
    default: () => true,
  },
});
const emits = defineEmits<{
  (events: "update:status", value: ValidatorStatus): void;
  (events: "update:valid", value: boolean): void;
}>();

const hint = computed(() => {
  if (inputStatus.value === ValidatorStatus.PENDING) return "Validating ...";
  if (inputStatus.value === ValidatorStatus.VALID) return props.validMessage;
  return undefined;
});

const hintPersistent = computed(() => {
  return (
    inputStatus.value === ValidatorStatus.PENDING || (inputStatus.value === ValidatorStatus.VALID && props.validMessage)
  );
});

const form = inject("form:validator", null) as FormValidatorService | null;

const isTouched = ref(false);
const initializedValidation = ref(false);
const touched = computed(() => isTouched.value || initializedValidation.value);

const errorMessage = ref<string>();
const required = ref(false);
const inputStatus = ref<ValidatorStatus>();
function setInputStatus(s: ValidatorStatus) {
  if (inputStatus.value !== s) {
    inputStatus.value = s;
    emits("update:valid", s === ValidatorStatus.VALID);
    form?.setStatus(uid!, s);
    if (s) emits("update:status", s);
  }
}

onMounted(async () => {
  // Check if the input is required
  for (const rule of props.rules) {
    const error = rule("");
    if (error && error.required) {
      required.value = true;
      break;
    }
  }
});
onUnmounted(() => form?.unregister(uid!));

function onBlur() {
  isTouched.value = true;
  validate(props.value?.toString() ?? "");
}

const onInput = debounce((value?: string | number) => validate(value?.toString() ?? ""), 250);
watch(() => props.value, onInput, { immediate: props.immediate });

defineExpose({
  validate,
  touch() {
    isTouched.value = true;
  },
  setInputStatus,
});

async function validate(value: string): Promise<boolean> {
  errorMessage.value = undefined;
  setInputStatus(ValidatorStatus.PENDING);
  for (const rule of [...props.rules, ...props.asyncRules]) {
    const error = await rule(value);
    if (error) {
      errorMessage.value = error.message;
      break;
    }
  }
  if (!initializedValidation.value && value) {
    initializedValidation.value = true;
  }
  setInputStatus(errorMessage.value ? ValidatorStatus.INVALID : ValidatorStatus.VALID);
  return inputStatus.value === ValidatorStatus.VALID;
}
</script>

<script lang="ts">
export enum ValidatorStatus {
  VALID = "VALID",
  INVALID = "INVALID",
  PENDING = "PENDING",
}

export default {
  name: "InputValidator",
};
</script>

<style lang="scss">
.is-valid-input {
  .v-messages__message {
    color: rgba(var(--v-theme-success));
  }
}
</style>
