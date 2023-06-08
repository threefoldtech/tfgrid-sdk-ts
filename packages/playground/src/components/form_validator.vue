<template>
  <slot></slot>
</template>

<script lang="ts">
import { computed, ref, watch } from "vue";

import { type FormValidatorService, provideForm, ValidatorStatus } from "@/hooks/form_validator";

export default {
  name: "FormValidator",
  props: ["modelValue"],
  emits: { "update:modelValue": (value: boolean) => value },
  setup(_, { emit, expose }) {
    const statusMap = ref(new Map<number, ValidatorStatus>());
    const validateMap = new Map<number, () => Promise<boolean>>();

    const valid = computed(() => [...statusMap.value.values()].every(status => status === ValidatorStatus.Valid));
    watch(valid, valid => emit("update:modelValue", valid), { immediate: true });

    const form: FormValidatorService = {
      register(uid, validate) {
        statusMap.value.set(uid, ValidatorStatus.Init);
        validateMap.set(uid, validate);
      },
      unregister(uid) {
        statusMap.value.delete(uid);
        validateMap.delete(uid);
      },

      async validate() {
        const valids = await Promise.all([...validateMap.values()].map(validate => validate()));
        return valids.every(valid => valid);
      },

      updateStatus(uid, status) {
        if (statusMap.value.get(uid) !== status) {
          statusMap.value.set(uid, status);
        }
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
