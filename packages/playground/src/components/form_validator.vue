<template>
  <slot></slot>
</template>

<script lang="ts">
import { computed, ref, watch } from "vue";

import { type FormValidatorService, provideForm, ValidatorStatus } from "@/hooks/form_validator";
import type { InputValidatorService } from "@/hooks/input_validator";

export default {
  name: "FormValidator",
  props: {
    modelValue: Boolean,
    validOnInit: Boolean,
  },
  emits: { "update:modelValue": (value: boolean) => value },
  setup(props, { emit, expose }) {
    const statusMap = ref(new Map<string, ValidatorStatus>());
    const serviceMap = ref(new Map<string, InputValidatorService>());

    const valid = computed(() =>
      [...statusMap.value.values()].every(status => {
        if (props.validOnInit) {
          return status === ValidatorStatus.Valid || status === ValidatorStatus.Init;
        }
        return status === ValidatorStatus.Valid;
      }),
    );
    watch(valid, valid => emit("update:modelValue", valid), { immediate: true });

    const form: FormValidatorService = {
      register(uid, service) {
        statusMap.value.set(uid, ValidatorStatus.Init);
        serviceMap.value.set(uid, service);
      },
      unregister(uid) {
        statusMap.value.delete(uid);
        serviceMap.value.delete(uid);
      },

      async validate() {
        const valids = await Promise.all([...serviceMap.value.values()].map(({ validate }) => validate()));
        return valids.every(valid => valid);
      },

      updateStatus(uid, status) {
        if (statusMap.value.get(uid) !== status) {
          statusMap.value.set(uid, status);
        }

        const el = serviceMap.value.get(uid)?.$el;
        if (status === ValidatorStatus.Valid && el) {
          const input =
            el instanceof HTMLElement
              ? el
              : el && typeof el === "object" && "value" in el && el.value instanceof HTMLElement
              ? el.value
              : null;

          if (input) {
            input.classList.remove("weblet-layout-error");
            setTimeout(() => input.classList.remove("weblet-layout-error-transition"), 152);
          }
        }
      },

      reset() {
        [...serviceMap.value.values()].map(({ reset }) => reset());
      },

      get: uid => serviceMap.value.get(uid),

      valid,
      invalid: computed(() => [...statusMap.value.values()].some(status => status === ValidatorStatus.Invalid)),
      pending: computed(() => [...statusMap.value.values()].some(status => status === ValidatorStatus.Pending)),
      validOnInit: props.validOnInit,
      inputs: computed(() => [...serviceMap.value.values()] as any),
    };

    provideForm(form);
    expose(form);
  },
};
</script>
