<template>
  <slot
    :props="{
      onBlur,
      loading,
      errorMessages,
      error: showError,
      hint: inputHint,
      'persistent-hint': hintPersistent,
      class: extraClass,
    }"
  ></slot>
</template>

<script lang="ts">
import debounce from "lodash/debounce.js";
import { computed, getCurrentInstance, onMounted, onUnmounted, type PropType, ref, watch } from "vue";

import { useForm, ValidatorStatus } from "@/hooks/form_validator";
import type { InputValidatorService } from "@/hooks/input_validator";

export default {
  name: "InputValidator",
  props: {
    modelValue: Boolean,
    status: String as PropType<ValidatorStatus>,
    rules: {
      type: Array as PropType<SyncRule[]>,
      required: true,
    },
    asyncRules: {
      type: Array as PropType<AsyncRule[]>,
      required: false,
      default: () => [] as AsyncRule[],
    },
    value: {
      type: String as PropType<string | number | undefined>,
      required: true,
    },
    validMessage: String,
    hint: String,
  },
  emits: {
    "update:modelValue": (valid: boolean) => valid,
    "update:status": (status: ValidatorStatus) => status,
  },
  setup(props, { emit, expose }) {
    const { uid } = getCurrentInstance() as { uid: number };
    const form = useForm();

    const required = computed(() => props.rules.some(rule => "required" in (rule("") || {})));

    const status = ref<ValidatorStatus>(ValidatorStatus.Init);
    function setStatus(newStatus: ValidatorStatus): void {
      if (status.value !== newStatus) {
        status.value = newStatus;
        emit("update:modelValue", newStatus === ValidatorStatus.Valid);
        emit("update:status", newStatus);
        form?.updateStatus(uid, newStatus);
      }
    }

    const error = ref<string | null>(null);
    async function validate(value = props.value): Promise<boolean> {
      setStatus(ValidatorStatus.Pending);

      value = (value || "").toString();
      error.value = null;

      if (!value && !required.value) {
        setStatus(ValidatorStatus.Valid);
        return true;
      }

      for (const rules of [...props.rules, ...props.asyncRules]) {
        const errorObj = await rules(value);
        if (errorObj) {
          error.value = errorObj.message;
          break;
        }
      }

      setStatus(error.value ? ValidatorStatus.Invalid : ValidatorStatus.Valid);
      return !error.value;
    }
    const debouncedValidate = debounce(validate, 250);

    const initializedInput = ref(false);
    watch(
      () => props.value,
      value => {
        /* Ignore initial passed value */

        if (!initializedInput.value) {
          initializedInput.value = true;
          if (!value) {
            return;
          }
        }

        setStatus(ValidatorStatus.Pending);
        debouncedValidate(value);
      },
      { immediate: true },
    );

    // Set Form connection
    onMounted(() => form?.register(uid, validate));
    onUnmounted(() => form?.unregister(uid));

    const obj: InputValidatorService = {
      validate,
      setStatus,
    };
    expose(obj);

    return {
      onBlur: () => validate(),
      loading: computed(() => status.value === ValidatorStatus.Pending),
      errorMessages: computed(() => (error.value ? [error.value] : [])),
      showError: computed(() => Boolean(error.value)),
      inputHint: computed(() => {
        if (status.value === ValidatorStatus.Pending) return "Validating...";
        if (status.value === ValidatorStatus.Valid) return props.validMessage || "";
        return props.hint || "";
      }),
      hintPersistent: computed(() => status.value !== ValidatorStatus.Invalid),
      extraClass: status.value === ValidatorStatus.Valid ? "is-valid-input" : undefined,
    };
  },
};

export type RuleReturn = { message: string; [key: string]: any } | undefined | void;
export type SyncRule = (value: string) => RuleReturn;
export type AsyncRule = (value: string) => Promise<RuleReturn>;
</script>

<style lang="scss">
.is-valid-input {
  .v-messages__message {
    color: rgba(var(--v-theme-success));
  }
}
</style>

<!-- :props="{
    onBlur: touched ? undefined : onBlur,
    errorMessages: touched ? errorMessage : undefined,
    error: touched && !!errorMessage,
    loading: inputStatus === ValidatorStatus.PENDING,
    hint,
    'persistent-hint': hintPersistent,
    class: inputStatus === ValidatorStatus.VALID ? 'is-valid-input' : undefined,
  }" -->
<!-- <script lang="ts" setup>
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
watch(inputStatus, s => {
  emits("update:valid", s === ValidatorStatus.VALID);
  form?.setValid(uid!, s === ValidatorStatus.VALID, reset);
  if (s) emits("update:status", s);
});

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
watch(() => props.value, onInput, { immediate: true });

defineExpose({
  reset,
  validate,
  touch() {
    isTouched.value = true;
  },
});
function reset() {
  isTouched.value = false;
  initializedValidation.value = false;
  errorMessage.value = undefined;
  inputStatus.value = undefined;
}

async function validate(value: string): Promise<boolean> {
  errorMessage.value = undefined;
  inputStatus.value = ValidatorStatus.PENDING;
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
  inputStatus.value = errorMessage.value ? ValidatorStatus.INVALID : ValidatorStatus.VALID;
  return inputStatus.value === ValidatorStatus.VALID;
}
</script>

<script lang="ts">


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
</style> -->
