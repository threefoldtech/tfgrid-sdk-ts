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
      <TfSelectFarm :filters="filters" :location="location" v-model="farm" />
      <TfAutoNodeSelector
        :filters="filters"
        :location="location"
        :farm="farm"
        v-model="node"
        v-model:valid="validNode"
      />
      <TfSelectGpu :node="node" :valid-node="validNode" v-if="filters.hasGPU" v-model="gpuCards" />
    </div>

    <div v-else>Manual (not yet implemented)</div>
  </section>
</template>

<script lang="ts">
import type { FarmInfo, GPUCardInfo, NodeInfo } from "@threefold/grid_client";
import { type PropType, type Ref, ref } from "vue";

import type { NodeSelectorFilters, SelectedLocation } from "../../types/nodeSelector";
import TfAutoNodeSelector from "./TfAutoNodeSelector.vue";
import TfSelectFarm from "./TfSelectFarm.vue";
import TfSelectGpu from "./TfSelectGpu.vue";
import TfSelectLocation from "./TfSelectLocation.vue";

export default {
  name: "TfSelectNode",
  components: { TfSelectLocation, TfSelectFarm, TfAutoNodeSelector, TfSelectGpu },
  props: {
    filters: {
      type: Object as PropType<NodeSelectorFilters>,
      default: () => ({}),
    },
  },
  setup() {
    const wayToSelect = ref<"manual" | "automated">("automated");
    const location = ref<SelectedLocation>({});
    const farm = ref({}) as Ref<FarmInfo>;

    const node = ref<NodeInfo>();
    const validNode = ref(false);
    const gpuCards = ref<GPUCardInfo[]>([]);

    return { wayToSelect, location, farm, node, validNode, gpuCards };
  },
};
</script>
