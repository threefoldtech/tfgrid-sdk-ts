<template>
  <v-card color="primary" class="d-flex mt-3 pa-1 pl-2">
    <v-card-title class="pa-0">Node Selection</v-card-title>
  </v-card>
  <h6 class="text-h6 mb-4 mt-2 ml-2">Choose a way to select Node</h6>
  <v-radio-group v-model="selection" color="primary" inline>
    <v-radio label="Automated" value="automated" class="mr-6"></v-radio>
    <v-radio label="Manual" value="manual"></v-radio>
  </v-radio-group>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";

import { Selection } from "@/utils/types";
const emits = defineEmits({
  "update:model-value": (value: Selection) => true || value,
});

const selection = ref(Selection.AUTOMATED);
watch(
  selection,
  selection => {
    emits("update:model-value", selection);
  },
  { immediate: true },
);
</script>

<script lang="ts">
export default {
  name: "NodeSelector",
};
</script>
