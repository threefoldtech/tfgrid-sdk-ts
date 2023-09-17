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
          <v-col cols="2" class="ml-2 mr-2 mb-2" v-for="key in Object.keys($props.modelValue)" :key="key">
            <v-text-field
              v-model="$props.modelValue[key].value"
              :label="$props.modelValue[key].label"
              hide-details
              :placeholder="$props.modelValue[key].placeholder"
              type="text"
            ></v-text-field>
          </v-col>
          <v-col cols="2" class="d-flex justify-center align-center">
            <v-btn @click="resetFilters" variant="outlined" color="primary">Reset filter</v-btn>
          </v-col>
        </v-row>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script lang="ts">
import type { PropType } from "vue";
import { defineComponent, ref } from "vue";

// import type { ExplorerFilterNodesType } from "../../../utils/types";

export default defineComponent({
  props: {
    modelValue: {
      type: Object as PropType<{ [key: string]: { label: string; placeholder: string; value: any } }>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const invalid = ref(false);

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
      invalid,
      resetFilters,
    };
  },
});
</script>
