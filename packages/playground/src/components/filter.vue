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
        <v-form class="mt-5">
          <v-row justify="center" justify-md="start" no-gutters>
            <form-validator
              v-model="isValidForm"
              valid-on-init
              ref="formRef"
              @update:model-value="$emit('update:valid', $event)"
            >
              <v-col
                cols="12"
                sm="4"
                md="2"
                class="d-flex justify-end align-center ml-2 mr-2 mb-2"
                v-for="key in Object.keys($props.modelValue)"
                :key="key"
              >
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
                    v-model="$props.modelValue[key].value"
                    :label="$props.modelValue[key].label"
                    :placeholder="$props.modelValue[key].placeholder"
                    :type="$props.modelValue[key].type"
                    :disabled="loading"
                    variant="outlined"
                    @update:model-value="checkInput"
                  ></v-text-field>
                </input-validator>
              </v-col>
              <!-- Options slot can be any other filter option, like GPU option, Gateway option, Node Status select -->
              <slot name="options"></slot>
            </form-validator>
          </v-row>

          <v-row>
            <v-col class="d-flex justify-end align-center mb-6">
              <v-btn
                class="mr-4"
                :disabled="!isValidForm || loading || !filterTouched"
                @click="resetFilters"
                variant="outlined"
                color="anchor"
                >Clear</v-btn
              >
              <v-btn
                :disabled="!isValidForm || !filterTouched"
                :loading="loading"
                @click="applyFilters"
                variant="outlined"
                color="secondary"
                >Apply</v-btn
              >
            </v-col>
          </v-row>
        </v-form>
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
