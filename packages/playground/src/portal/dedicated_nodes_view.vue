<template>
  <div>
    <v-container>
      <v-card color="primary" class="d-flex justify-center items-center mt-3 pa-3 text-center">
        <v-icon size="30" class="pr-3">mdi-resistor-nodes</v-icon>
        <v-card-title class="pa-0" color="white">Dedicated Node</v-card-title>
      </v-card>

      <!-- Filters -->
      <dedicated-node-filters :filters="filters" />
      <!-- Table -->
      <nodes-table />
    </v-container>
  </div>
</template>

<script setup lang="ts">
const filters = [
  {
    label: "Total SRU (GB)",
    key: "total_sru",
    placeholder: "Filter by total SSD greater than or equal to.",
  },
  {
    label: "Total HRU (GB)",
    key: "total_hru",
    placeholder: "Filter by total HDD greater than or equal to.",
  },
  {
    label: "Total MRU (GB)",
    key: "total_mru",
    placeholder: "Filter by total Memory greater than or equal to.",
  },
  {
    label: "Total CRU (Cores)",
    key: "total_cru",
    placeholder: "Filter by total Cores greater than or equal to.",
  },
  {
    label: "GPU's vendor name",
    key: "gpu_vendor_name",
    placeholder: "Filter by GPU's vendor name.",
  },
  {
    label: "GPU's device name",
    key: "gpu_device_name",
    placeholder: "Filter by GPU's device name.",
  },
];
</script>

<script lang="ts">
import DedicatedNodeFilters from "../components/dedicated_node_filter.vue";
import NodesTable from "../components/nodes_table.vue";

export default {
  name: "Dedicated Node",
  components: {
    DedicatedNodeFilters,
    NodesTable,
  },
};
</script>

<style></style>
