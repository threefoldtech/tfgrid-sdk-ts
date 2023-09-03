<template>
  <v-combobox
    :item-value="value"
    :items="items"
    chips
    solo
    multiple
    label="Please choose some filters."
    placeholder="Please choose some filters."
  >
  </v-combobox>
</template>

<script lang="ts">
import type { PropType } from "vue";
export default {
  props: {
    value: Array as PropType<string[]>,
    items: Array as PropType<string[]>,
  },
};
</script>
