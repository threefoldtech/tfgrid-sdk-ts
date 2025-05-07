<template>
  <slot />
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
    const invalid = computed(() => [...statusMap.value.values()].some(status => status === ValidatorStatus.Invalid));
    const pending = computed(() => [...statusMap.value.values()].some(status => status === ValidatorStatus.Pending));
    /**
     * The validation is considered "init" if:
     * - There are no invalid (`ValidatorStatus.Invalid`) statuses.
     * - There are no pending (`ValidatorStatus.Pending`) statuses.
     * - At least one status is `ValidatorStatus.Init`.
     */
    const init = computed(
      () =>
        !invalid.value &&
        !pending.value &&
        [...statusMap.value.values()].some(status => status === ValidatorStatus.Init),
    );
    const form: FormValidatorService = {
      register(uid: string, service) {
        statusMap.value.set(uid, ValidatorStatus.Init);
        // @ts-expect-error: Service might not fully implement, but it is fully functional
        serviceMap.value.set(uid, service);
      },
      unregister(uid: string) {
        statusMap.value.delete(uid);
        serviceMap.value.delete(uid);
      },

      async validate() {
        const valids = await Promise.all([...serviceMap.value.values()].map(({ validate }) => validate()));
        return valids.every(valid => valid);
      },

      updateStatus(uid: string, status: ValidatorStatus) {
        if (statusMap.value.get(uid) !== status) {
          statusMap.value.set(uid, status);
        }

        const el = serviceMap.value.get(uid)?.$el;
        if (status === ValidatorStatus.Valid && el) {
          const input =
            el instanceof HTMLElement
              ? el
              : el &&
                  typeof el === "object" &&
                  "value" in el &&
                  (el as { value: HTMLElement }).value instanceof HTMLElement
                ? (el as { value: HTMLElement }).value
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

      get: (uid: string) => serviceMap.value.get(uid) as InputValidatorService | undefined,

      valid,
      invalid,
      pending,
      init,
      validOnInit: props.validOnInit,
      inputs: computed(() => [...serviceMap.value.values()] as any),
    };

    provideForm(form);
    expose(form);
  },
};
</script>
