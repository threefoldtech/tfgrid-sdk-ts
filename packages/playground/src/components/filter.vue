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
        <v-form>
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
                    :loading="loading"
                  ></v-text-field>
                </input-validator>
              </v-col>
            </form-validator>
          </v-row>

          <v-row>
            <v-col cols="12" sm="4" md="2" class="d-flex justify-start align-center mb-6 ml-4">
              <v-btn
                :disabled="!isValidForm"
                :loading="loading"
                @click="applyFilters"
                variant="outlined"
                color="secondary"
                class="mr-4"
                >Apply</v-btn
              >
              <v-btn :disabled="!isValidForm" :loading="loading" @click="resetFilters" variant="outlined" color="anchor"
                >Clear</v-btn
              >
            </v-col>
          </v-row>
        </v-form>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script lang="ts" setup>
import { defineComponent, type PropType, ref } from "vue";

import { useInputRef } from "@/hooks/input_validator";

import { useFormRef } from "../hooks/form_validator";
import type { InputFilterType } from "../types";

const props = defineProps({
  modelValue: {
    type: Object as PropType<{ [key: string]: InputFilterType }>,
    required: true,
  },
  loading: Boolean,
});

const emit = defineEmits(["update:model-value", "update:valid"]);
const isValidForm = ref(false);
const inputRef = useInputRef(true);
const panel = ref([0]);
const formRef = useFormRef();

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
    "update:model-value",
    Object.keys(props.modelValue).reduce((res, key) => {
      res[key] = { ...props.modelValue[key], value: undefined };
      return res;
    }, {} as any),
  );
};
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
