<template>
  <form-validator valid-on-init ref="formRef" @update:model-value="$emit('update:valid', $event)">
    <v-expansion-panels
      @update:model-value="
        e => {
          if (typeof e === 'number') {
            formRef.validate();
          }
        }
      "
    >
      <v-expansion-panel>
        <v-expansion-panel-title>
          <template v-slot:default="{}">
            <v-row no-gutters>
              <v-col cols="4" class="d-flex justify-start text-subtitle-1"> Filters</v-col>
            </v-row>
          </template>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-row justify="center" justify-md="start" no-gutters>
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
                #="{ props }"
                :rules="$props.modelValue[key].rules?.[0] ?? []"
                :async-rules="$props.modelValue[key].rules?.[1] ?? []"
                :value="$props.modelValue[key].value"
              >
                <v-text-field
                  :disabled="formDisabled"
                  v-bind="props"
                  v-model="$props.modelValue[key].value"
                  :label="$props.modelValue[key].label"
                  :placeholder="$props.modelValue[key].placeholder"
                  :type="$props.modelValue[key].type"
                ></v-text-field>
              </input-validator>
            </v-col>
            <v-col cols="12" sm="4" md="2" class="d-flex justify-start align-center mb-6 ml-4">
              <v-btn
                :disabled="!isFiltersTouched || formDisabled"
                @click="resetFilters"
                variant="outlined"
                color="primary"
                >Reset Filters</v-btn
              >
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </form-validator>
</template>

<script lang="ts">
import { defineComponent, type PropType, ref, watch } from "vue";

import { useFormRef } from "@/hooks/form_validator";
import type { NodeInputFilterType } from "@/utils/filter_nodes";

export default defineComponent({
  name: "NodeFilters",
  props: {
    modelValue: {
      type: Object as PropType<{ [key: string]: NodeInputFilterType }>,
      required: true,
    },
    formDisabled: Boolean,
    valid: Boolean,
  },

  setup(props, { emit }) {
    const formRef = useFormRef();
    const isFiltersTouched = ref<boolean>(false);

    watch(
      () => props.modelValue,
      (newValue: PropType<{ [key: string]: NodeInputFilterType }>) => {
        const hasNonEmptyValue = Object.keys(newValue).some(obj => {
          return Reflect.get(newValue, obj).value && Reflect.get(newValue, obj).value.length >= 1;
        });

        isFiltersTouched.value = hasNonEmptyValue;
      },
      { deep: true },
    );

    const resetFilters = () => {
      emit(
        "update:model-value",
        Object.keys(props.modelValue).reduce((res, key) => {
          res[key] = { ...props.modelValue[key], value: undefined };
          return res;
        }, {} as any),
      );
    };

    return {
      resetFilters,
      isFiltersTouched,
      formRef,
    };
  },
});
</script>
<style scoped>
.v-expansion-panel-title {
  padding: 6px 24px;
}
</style>
