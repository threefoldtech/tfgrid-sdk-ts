<template>
  <section>
    <h3 class="bg-primary pa-2 text-h6 rounded">Node Selection</h3>
    <p class="text-h6 mb-4 mt-2 ml-2">Choose a way to select Node</p>

    <v-radio-group v-model="wayToSelect" color="primary" inline>
      <v-radio label="Automated" value="automated" class="mr-6"></v-radio>
      <v-radio label="Manual" value="manual"></v-radio>
    </v-radio-group>

    <div v-if="wayToSelect === 'automated'">
      <TfSelectLocation v-model="location" />
    </div>

    <div v-else>Manual (not yet implemented)</div>
  </section>
</template>

<script lang="ts">
import { type Ref, ref } from "vue";

import type { SelectedLocation } from "../../types/nodeSelector";
import TfSelectLocation from "./TfSelectLocation.vue";

export default {
  name: "TfSelectNode",
  components: { TfSelectLocation },
  setup() {
    const wayToSelect = ref<"manual" | "automated">("automated") as Ref;
    const location = ref<SelectedLocation>({ region: "Europe" });

    return {
      wayToSelect,

      location,
    };
  },
};
</script>
