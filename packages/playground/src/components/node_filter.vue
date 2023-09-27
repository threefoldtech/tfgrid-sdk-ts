<template>
  <v-expansion-panels>
    <v-expansion-panel>
      <v-expansion-panel-title>
        <template v-slot:default="{}">
          <v-row no-gutters>
            <v-col cols="4" class="d-flex justify-start text-h6"> Filters</v-col>
          </v-row>
        </template>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-row no-gutters>
          <v-col
            cols="2"
            class="d-flex justify-end align-center ml-2 mr-2 mb-2"
            v-for="key in Object.keys($props.modelValue)"
            :key="key"
          >
            <input-validator
              v-if="$props.modelValue[key].label"
              v-model:error="$props.modelValue[key].error"
              #="{ props }"
              :rules="$props.modelValue[key].rules?.[0] ?? []"
              :async-rules="$props.modelValue[key].rules?.[1] ?? []"
              :value="$props.modelValue[key].value"
            >
              <v-text-field
                v-bind="props"
                v-model="$props.modelValue[key].value"
                :label="$props.modelValue[key].label"
                :placeholder="$props.modelValue[key].placeholder"
                :type="$props.modelValue[key].type"
              ></v-text-field>
            </input-validator>
          </v-col>
          <v-col cols="2" class="d-flex justify-start align-center mb-6 ml-4">
            <v-btn @click="resetFilters" variant="outlined" color="primary">Reset filter</v-btn>
          </v-col>
        </v-row>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script lang="ts">
import type { PropType } from "vue";
import { defineComponent } from "vue";

import type { NodeInputFilterType } from "@/utils/filter_nodes";

export default defineComponent({
  props: {
    modelValue: {
      type: Object as PropType<{ [key: string]: NodeInputFilterType }>,
      required: true,
    },
  },

  setup(props, { emit }) {
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
    };
  },
});
</script>
