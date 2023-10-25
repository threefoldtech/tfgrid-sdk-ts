<template>
  <div>
    <div class="border px-4 pb-4 rounded position-relative mt-2">
      <v-card color="primary" class="d-flex justify-center items-center mt-3 pa-3 text-center">
        <v-icon size="30" class="pr-3">mdi-resistor-nodes</v-icon>
        <v-card-title class="pa-0" color="white">Dedicated Nodes</v-card-title>
      </v-card>

      <!-- Table -->
      <nodes-table />
    </div>
  </div>
</template>

<script lang="ts">
import NodesTable from "@/portal/components/dedicated_nodes_table.vue";

export default {
  name: "Dedicated Node",
  components: {
    NodesTable,
  },
};
</script>

<style scoped>
.v-data-table__td {
  white-space: nowrap;
  font-size: 0.875rem;
}

.v-table .v-btn {
  font-size: 0.875rem !important;
  white-space: nowrap;
}
</style>
