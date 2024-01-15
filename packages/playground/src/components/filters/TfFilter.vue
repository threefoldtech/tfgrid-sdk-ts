<template>
  <VCol cols="12" md="6" lg="3">
    <input-validator
      :rules="$props.rules || []"
      :async-rules="$props.asyncRules"
      :value="$props.modelValue"
      v-if="$slots.input"
      #="{ props }"
    >
      <slot name="input" :props="props" />
    </input-validator>
    <slot v-else />
  </VCol>
</template>

<script lang="ts">
import { computed, type PropType, ref, toRef } from "vue";

import type { AsyncRule, SyncRule } from "../input_validator.vue";
import { useFiltersContainerService } from "./TfFiltersContainer.vue";

export default {
  name: "TfFilter",
  props: {
    modelValue: { type: String as PropType<string | number>, required: true },
    rules: Array as PropType<SyncRule[]>,
    asyncRules: Array as PropType<AsyncRule[]>,
    queryRoute: { type: String, required: true },
  },
  emits: {
    "update:model-value": (value: string | number) => true || value,
  },
  setup(_props, ctx) {
    // eslint-disable-next-line vue/no-setup-props-destructure
    const initialValue = _props.modelValue;

    const filtersContainerService = useFiltersContainerService();

    const props = toRef(_props);

    const baseValue = ref(props.value.modelValue);

    function clear() {
      ctx.emit("update:model-value", initialValue);
      if (baseValue.value === initialValue) {
        return false;
      }

      baseValue.value = initialValue;
      return true;
    }

    function apply() {
      baseValue.value = props.value.modelValue;
    }

    const changed = computed(() => baseValue.value !== props.value.modelValue);
    const empty = computed(() => !props.value.modelValue);

    const service = computed(() => ({
      changed: changed.value,
      clear,
      apply,
      empty: empty.value,
    }));

    filtersContainerService.register(_props.queryRoute, service);

    return { baseValue, changed };
  },
};
</script>
