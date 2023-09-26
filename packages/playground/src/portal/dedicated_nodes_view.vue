<template>
  <div>
    <v-container>
      <v-card color="primary" class="d-flex justify-center items-center mt-3 pa-3 text-center">
        <v-icon size="30" class="pr-3">mdi-resistor-nodes</v-icon>
        <v-card-title class="pa-0" color="white">Dedicated Node</v-card-title>
      </v-card>

      <!-- Filters -->
      <dedicated-node-filters :filters="filters" />
      <div class="pt-5">
        <v-card>
          <v-tabs v-model="activeTab" align-tabs="center">
            <v-tab :value="0" color="primary" class="pr-8">Rentable</v-tab>
            <v-tab :value="1" color="primary" class="pr-8">Rented</v-tab>
            <v-tab :value="2" color="primary" class="pr-8">Mine</v-tab>
          </v-tabs>
        </v-card>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
const activeTab = ref(0);

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

export default {
  name: "Dedicated Node",
  components: {
    DedicatedNodeFilters,
  },
};
</script>

<style></style>
