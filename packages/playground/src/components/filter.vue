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
              <slot name="options" :props="fitlerColProps"> </slot>
            </v-row>
          </v-container>
        </form-validator>

        <v-divider class="mb-4 mx-8" />
        <v-container fluid>
          <v-row justify="end">
            <v-btn
              :disabled="!valueChanged || loading"
              @click="resetFilters"
              variant="outlined"
              color="anchor"
              text="Clear"
            />
            <v-btn
              :disabled="!isValidForm || !valueChanged || loading"
              class="ml-4 mr-7"
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
import { defineComponent, nextTick, type PropType, ref, watch } from "vue";

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

const emit = defineEmits(["apply", "update:valid", "reset"]);
const isValidForm = ref(false);
const inputRef = useInputRef(true);
const panel = ref([0]);
const formRef = useFormRef();

const valueChanged = ref(false);

const applyFilters = () => {
  emit(
    "apply",
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

  nextTick(() => {
    valueChanged.value = true;
  });
};

const fitlerColProps = { class: "py-2 px-4", cols: 12, md: 6, lg: 3 };

// Enable/Disable the [Apply, Clear] buttons.
watch(
  [() => props.modelValue, () => props.options],
  ([inputs, options]) => {
    const optionsChanged = options.gateway || options.gpu || (options.status && options.status?.length >= 1);
    const inputsHasValues = Object.values(inputs).some(obj => obj.value && obj.value.length >= 1);
    valueChanged.value = inputsHasValues || !!optionsChanged;
  },
  { deep: true, immediate: true },
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
