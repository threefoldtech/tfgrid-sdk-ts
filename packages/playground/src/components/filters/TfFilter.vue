<template>
  <slot name="unwrap" v-if="$slots.unwrap" :colProps="colProps" />
  <VCol v-else v-bind="colProps">
    <input-validator
      :rules="$props.rules || []"
      :async-rules="$props.asyncRules"
      :value="($props.modelValue as string)"
      v-if="$slots.input"
      #="{ props }"
    >
      <slot name="input" :props="props" />
    </input-validator>
    <slot v-else />
  </VCol>
</template>

<script lang="ts">
import { computed, onUnmounted, type PropType, ref, toRef } from "vue";
import { useRouter } from "vue-router";

import type { AsyncRule, SyncRule } from "../input_validator.vue";
import { useFiltersContainerService } from "./TfFiltersContainer.vue";

const colProps = { class: "tf-filter-item py-1", cols: 12 };

function normalizeValue(v: string) {
  if (v === "true") return true;
  if (v === "false") return false;
  return v;
}

export default {
  name: "TfFilter",
  props: {
    modelValue: { type: [String, Boolean] as PropType<string | boolean>, required: true },
    rules: Array as PropType<SyncRule[]>,
    asyncRules: Array as PropType<AsyncRule[]>,
    queryRoute: { type: String, required: true },
  },
  emits: {
    "update:model-value": (value: string | boolean) => true || value,
  },
  setup(_props, ctx) {
    const props = toRef(_props);
    const router = useRouter();

    // Router Query
    const query = router.currentRoute.value.query[props.value.queryRoute];
    query && typeof query === "string" && ctx.emit("update:model-value", normalizeValue(query));

    // eslint-disable-next-line vue/no-setup-props-destructure
    const initialValue = props.value.modelValue;

    const filtersContainerService = useFiltersContainerService();

    const baseValue = ref(props.value.modelValue);

    function clear() {
      ctx.emit("update:model-value", initialValue);
      if (baseValue.value === initialValue) {
        return false;
      }

      baseValue.value = initialValue;
      return true;
    }

    function apply(): [name: string, value?: string] {
      baseValue.value = props.value.modelValue;

      return [
        props.value.queryRoute,
        props.value.modelValue === initialValue ? undefined : props.value.modelValue.toString(),
      ];
    }

    const changed = computed(() => baseValue.value !== props.value.modelValue);
    const empty = computed(() => !props.value.modelValue);

    const service = computed(() => ({
      changed: changed.value,
      clear,
      apply,
      empty: empty.value,
    }));

    filtersContainerService.register(props.value.queryRoute, service);
    onUnmounted(() => {
      const changed = props.value.modelValue !== initialValue;
      changed && ctx.emit("update:model-value", initialValue);
      filtersContainerService.unregister(props.value.queryRoute, changed);
    });

    return { colProps };
  },
};
</script>

<style>
.tf-filter-item .v-label {
  font-size: 14px !important;
}
</style>
