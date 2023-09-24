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

import type { INode } from "../utils/filter_nodes";

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
      type: String as PropType<string | number | INode | undefined>,
      required: true,
    },
    validMessage: String,
    hint: String,
    disableValidation: Boolean,
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

    watch(
      () => props.disableValidation,
      (disabled, wasDisabled) => {
        const isEnabled = !disabled;
        const wasEnabled = !wasDisabled;

        if (disabled && wasEnabled) {
          form?.unregister(uid);
          error.value = null;
          setStatus(ValidatorStatus.Valid);
        }

        if (wasDisabled && isEnabled) validate();
      },
    );

    const blured = ref(false);
    function onBlur() {
      blured.value = true;
      validate();
    }

    // Set Form connection
    const obj: InputValidatorService = {
      validate,
      setStatus,
      reset() {
        blured.value = false;
        setStatus(ValidatorStatus.Init);
        error.value = null;
      },
      status: status as unknown as ValidatorStatus,
      error: error as unknown as string | null,
    };
    onMounted(() => form?.register(uid, obj));
    onUnmounted(() => form?.unregister(uid));
    expose(obj);

    return {
      onBlur: computed(() => (blured.value ? undefined : onBlur)),
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
