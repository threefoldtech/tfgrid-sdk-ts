<template>
  <div>
    <v-container>
      <v-card color="primary" class="d-flex justify-center items-center mt-3 pa-3 text-center">
        <v-icon size="30" class="pr-3">mdi-resistor-nodes</v-icon>
        <v-card-title class="pa-0" color="white">Dedicated Node</v-card-title>
      </v-card>

      <!-- Table -->
      <nodes-table />
    </v-container>
  </div>
</template>

<script lang="ts">
import NodesTable from "../components/dedicated_nodes_table.vue";

export default {
  name: "Dedicated Node",
  components: {
    NodesTable,
  },
};
</script>

<style></style>
