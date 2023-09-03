<template>
  <v-card flat color="transparent">
    <v-subheader class="pl-4 text-subtitle-2 mb-2">{{ label }}</v-subheader>
    <v-text-field
      v-model="item"
      chips
      clearable
      :label="placeholder"
      solo
      type="text"
      @update:model-value="$emit('changeValue', filterKey, item)"
    />
    <!-- :rules="[validated(item, filterKey)]" -->
    <!-- <v-alert dense type="error" v-if="errorMsg">
      {{ errorMsg }}
    </v-alert> -->
  </v-card>
</template>

<script lang="ts">
import type { PropType } from "vue";
import { defineComponent, ref } from "vue";

export default defineComponent({
  props: {
    label: String as PropType<string>,
    placeholder: String as PropType<string>,
    filterKey: String as PropType<string>,
    value: Array as PropType<string[]>,
  },

  setup() {
    const item = ref("");
    const invalid = ref(false);

    return {
      item,
      invalid,
    };
  },
});
</script>
