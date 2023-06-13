<template>
  <slot></slot>
</template>

<script lang="ts">
import { computed, ref, watch } from "vue";

import { type FormValidatorService, provideForm, ValidatorStatus } from "@/hooks/form_validator";
import type { InputValidatorService } from "@/hooks/input_validator";

export default {
  name: "FormValidator",
  props: ["modelValue"],
  emits: { "update:modelValue": (value: boolean) => value },
  setup(_, { emit, expose }) {
    const statusMap = ref(new Map<number, ValidatorStatus>());
    const serviceMap = new Map<number, InputValidatorService>();

    const valid = computed(() => [...statusMap.value.values()].every(status => status === ValidatorStatus.Valid));
    watch(valid, valid => emit("update:modelValue", valid), { immediate: true });

    const form: FormValidatorService = {
      register(uid, service) {
        statusMap.value.set(uid, ValidatorStatus.Init);
        serviceMap.set(uid, service);
      },
      unregister(uid) {
        statusMap.value.delete(uid);
        serviceMap.delete(uid);
      },

      async validate() {
        const valids = await Promise.all([...serviceMap.values()].map(({ validate }) => validate()));
        return valids.every(valid => valid);
      },

      updateStatus(uid, status) {
        if (statusMap.value.get(uid) !== status) {
          statusMap.value.set(uid, status);
        }
      },

      reset() {
        [...serviceMap.values()].map(({ reset }) => reset());
      },

      valid,
      invalid: computed(() => [...statusMap.value.values()].some(status => status === ValidatorStatus.Invalid)),
      pending: computed(() => [...statusMap.value.values()].some(status => status === ValidatorStatus.Pending)),
    };

    provideForm(form);
    expose(form);
  },
};
</script>
