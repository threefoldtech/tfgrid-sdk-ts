<template>
  <v-row class="d-flex pt-0">
    <v-col class="d-flex justify-start pb-0 align-center">
      <div v-for="(network, index) in networks" :key="index" class="px-2">
        <v-switch hide-details color="primary" inset :label="network + ' Nodes'" />
      </div>
    </v-col>
    <v-col class="d-flex justify-end pt-5 pb-0">
      <v-btn flat color="blue" prepend-icon="mdi-reload" text="Refresh"></v-btn>
    </v-col>
    <v-divider :thickness="2" class="border-opacity-50 pb-4" color="gray"></v-divider>
  </v-row>
</template>

<script lang="ts" setup>
const networks = ["Dev", "Main", "Test"];
</script>
<script lang="ts">
export default {
  name: "networkFilter",
};
</script>

<style></style>
