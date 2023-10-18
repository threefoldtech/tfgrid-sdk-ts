<template>
  <v-container fluid class="pa-0">
    <v-sheet color="title" class="w-100 d-flex align-center justify-center">
      <v-icon class="mr-1" size="large" icon="mdi-chart-scatter-plot"> </v-icon>
      <p class="my-2 font-weight-bold text-h6">Statistics</p>
    </v-sheet>
    <v-col cols="11" class="mx-auto pb-0">
      <networkFilter v-model="networks"></networkFilter>
      <statsTable :networks="networks"></statsTable>
    </v-col>
    <v-sheet style="position: fixed; bottom: 0%" class="w-100 d-flex align-center justify-center">
      <p class="my-1 font-weight-bold">{{ new Date().getFullYear() }} - ThreeFoldTech</p>
    </v-sheet>
  </v-container>
</template>

<script lang="ts" setup>
import { Network } from "@threefold/gridproxy_client";
import { type Ref, ref } from "vue";

import networkFilter from "../components/network_filter.vue";
import statsTable from "../components/stats_table.vue";
const networks = ref() as Ref<Network[]>;
</script>
<script lang="ts">
export default {
  components: { networkFilter, statsTable },
  name: "StatisticsView",
};
</script>
