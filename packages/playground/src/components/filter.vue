<template>
  <v-expansion-panels v-model="panel" class="mb-3">
    <v-expansion-panel>
      <v-expansion-panel-title>
        <template v-slot:default="{}">
          <v-row no-gutters>
            <v-col cols="4" class="d-flex justify-start text-subtitle-1"> Filters</v-col>
          </v-row>
        </template>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <form-validator
          v-model="isValidForm"
          valid-on-init
          ref="formRef"
          @update:model-value="$emit('update:valid', $event)"
        >
          <VContainer fluid>
            <VRow no-gutters>
              <VCol v-for="key in Object.keys($props.modelValue)" :key="key" v-bind="fitlerColProps">
                <input-validator
                  v-if="$props.modelValue[key].label"
                  :rules="$props.modelValue[key].value ? $props.modelValue[key].rules?.[0] ?? [] : []"
                  :async-rules="$props.modelValue[key].rules?.[1] ?? []"
                  :value="$props.modelValue[key].value"
                  #="{ props }"
                  ref="inputRef"
                >
                  <v-text-field
                    v-bind="props"
                    variant="outlined"
                    v-model="$props.modelValue[key].value"
                    :label="$props.modelValue[key].label"
                    :type="$props.modelValue[key].type"
                    :disabled="loading"
                    @update:model-value="checkInput"
                  >
                    <template #append-inner>
                      <VTooltip :text="$props.modelValue[key].tooltip">
                        <template #activator="{ props }">
                          <VIcon icon="mdi-information-outline" v-bind="props" />
                        </template>
                      </VTooltip>
                    </template>
                  </v-text-field>
                </input-validator>
              </VCol>
              <slot name="options" :props="fitlerColProps"></slot>
            </VRow>
          </VContainer>
        </form-validator>

        <VContainer fluid>
          <VRow justify="end">
            <v-btn
              :disabled="!isValidForm || loading || !filterTouched"
              @click="resetFilters"
              variant="outlined"
              color="anchor"
              text="Clear"
            />
            <v-btn
              class="ml-4 mr-7"
              :disabled="!isValidForm || !filterTouched"
              :loading="loading"
              @click="applyFilters"
              variant="outlined"
              color="secondary"
              text="Apply"
            />
          </VRow>
        </VContainer>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script lang="ts" setup>
import { defineComponent, type PropType, ref, watch } from "vue";

import { useInputRef } from "@/hooks/input_validator";

import { useFormRef } from "../hooks/form_validator";
import type { FilterOptions, InputFilterType } from "../types";

const props = defineProps({
  modelValue: {
    type: Object as PropType<{ [key: string]: InputFilterType }>,
    required: true,
  },
  options: {
    type: Object as PropType<FilterOptions>,
    required: true,
  },
  loading: Boolean,
  valid: Boolean,
});

const emit = defineEmits(["update:model-value", "update:valid", "reset"]);
const isValidForm = ref(false);
const inputRef = useInputRef(true);
const panel = ref([0]);
const formRef = useFormRef();
const filterTouched = ref(false);
const checkInput = (input: string) => {
  if (input.length == 0) {
    applyFilters();
  }
};
const applyFilters = () => {
  emit(
    "update:model-value",
    Object.keys(props.modelValue).reduce((res, key) => {
      res[key] = { ...props.modelValue[key] };
      return res;
    }, {} as any),
  );
};
const resetFilters = () => {
  emit(
    "reset",
    Object.keys(props.modelValue).reduce((res, key) => {
      res[key] = { ...props.modelValue[key], value: undefined };
      return res;
    }, {} as any),
  );
};
watch(
  () => props.modelValue,
  (newValue: PropType<{ [key: string]: InputFilterType }>) => {
    const hasNonEmptyValue = Object.keys(newValue).some(obj => {
      return Reflect.get(newValue, obj).value && Reflect.get(newValue, obj).value.length >= 1;
    });
    filterTouched.value = hasNonEmptyValue;
  },
  { deep: true },
);
watch(
  () => props.options,
  (newValue: FilterOptions) => {
    if (newValue.gateway || newValue.gpu || newValue.status) {
      // We don't need to enable the clear button when changing the page or the size.
      const hasValue = !!newValue.gateway || !!newValue.gpu || !!newValue.status?.length;
      filterTouched.value = hasValue;
    }
  },
  { deep: true },
);

const fitlerColProps = { class: "py-2 px-4", cols: 12, md: 6, lg: 3 };
</script>

<script lang="ts">
export default defineComponent({
  name: "Filters",
});
</script>
<style scoped>
.v-expansion-panel-title {
  padding: 6px 24px;
}
</style>
