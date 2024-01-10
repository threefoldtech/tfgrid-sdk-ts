<template>
  <v-expansion-panels v-model="panel" class="mb-3">
    <v-expansion-panel>
      <template #title>
        <span class="text-subtitle-1" v-text="'Filters'" />
      </template>

      <v-expansion-panel-text>
        <form-validator
          v-model="isValidForm"
          valid-on-init
          ref="formRef"
          @update:model-value="$emit('update:valid', $event)"
        >
          <v-container fluid>
            <v-row no-gutters>
              <v-col v-for="key in Object.keys($props.modelValue)" :key="key" v-bind="fitlerColProps">
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
                      <v-tooltip :text="$props.modelValue[key].tooltip">
                        <template #activator="{ props }">
                          <VIcon icon="mdi-information-outline" v-bind="props" />
                        </template>
                      </v-tooltip>
                    </template>
                  </v-text-field>
                </input-validator>
              </v-col>
              <slot
                name="options"
                :props="fitlerColProps"
                :applyFilters="!isValidForm || loading || !valueChanged ? () => {} : applyFilters"
              >
              </slot>
            </v-row>
          </v-container>
        </form-validator>

        <v-divider class="mb-4 mx-8" />

        <v-container fluid>
          <v-row justify="end">
            <v-btn
              :disabled="!isValidForm || loading || !valueChanged"
              @click="resetFilters"
              variant="outlined"
              color="anchor"
              text="Clear"
            />
            <v-btn
              class="ml-4 mr-7"
              :disabled="!isValidForm || !valueChanged"
              :loading="loading"
              @click="applyFilters"
              variant="outlined"
              color="secondary"
              text="Apply"
            />
          </v-row>
        </v-container>
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
const valueChanged = ref(false);

const checkInput = (input: string) => {
  if (input.length == 0) {
    applyFilters();
  }
};

const applyFilters = () => {
  valueChanged.value = false;
  emit(
    "update:model-value",
    Object.keys(props.modelValue).reduce((res, key) => {
      res[key] = { ...props.modelValue[key] };
      return res;
    }, {} as any),
  );
};

const resetFilters = () => {
  valueChanged.value = false;
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
    valueChanged.value = hasNonEmptyValue;
  },
  { deep: true },
);

watch(
  () => props.options,
  (newValue: FilterOptions) => {
    if (newValue.gateway || newValue.gpu || newValue.status) {
      // We don't need to enable the clear button when changing the page or the size.
      const hasValue = !!newValue.gateway || !!newValue.gpu || !!newValue.status?.length;
      valueChanged.value = hasValue;
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
