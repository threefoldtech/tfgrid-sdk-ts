<template>
  <VCol cols="3">
    <input-validator
      :rules="($props.rules as SyncRule[])"
      :async-rules="$props.asyncRules"
      :value="$props.modelValue"
      #="{ props }"
      v-if="$slots.input"
    >
      <slot name="input" :props="props" />
    </input-validator>

    <slot v-else />
  </VCol>
</template>

<script lang="ts">
import type { PropType } from "vue";
import { computed, ref, toRef } from "vue";

import type { AsyncRule, SyncRule } from "../input_validator.vue";
import { type FilterService, useFilterContainer } from "./FiltersContainer.vue";

export default {
  name: "TfFilter",
  props: {
    routeQuery: { type: String, required: true },
    modelValue: { type: [String, Number], required: false },
    rules: { type: Array as PropType<SyncRule[]>, default: () => [] },
    asyncRules: Array as PropType<AsyncRule[]>,
  },
  emits: {
    "update:model-value": () => true,
  },
  setup(props, ctx) {
    const propsRef = toRef(props);

    const baseValue = ref(propsRef.value.modelValue);
    const filterContainer = useFilterContainer();

    function reset() {
      baseValue.value = propsRef.value.modelValue;
    }

    function clear() {
      ctx.emit("update:model-value");
    }

    const value = computed(() => propsRef.value.modelValue);
    const changed = computed(() => baseValue.value !== value.value);

    const service = computed<FilterService>(() => {
      return {
        value: value.value,
        changed: changed.value,
        reset,
        clear,
      };
    });

    filterContainer.register(propsRef.value.routeQuery, service);
  },
};
</script>
