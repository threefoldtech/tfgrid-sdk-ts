<template>
  <section>
    <h3 class="bg-primary pa-2 text-h6 rounded">Node Selection</h3>
    <p class="text-h6 mb-4 mt-2 ml-2">Choose a way to select Node</p>

    <v-radio-group v-model="wayToSelect" color="primary" inline>
      <v-radio label="Automated" value="automated" class="mr-6"></v-radio>
      <v-radio label="Manual" value="manual"></v-radio>
    </v-radio-group>
  </section>
</template>

<script lang="ts">
import { ref } from "vue";

export default {
  name: "TfSelectNode",
  setup() {
    const wayToSelect = ref<"manual" | "automated">("automated");

    return {
      wayToSelect,
    };
  },
};
</script>
