<template>
  <v-col cols="11" class="mx-auto pt-0">
    <networkFilter
      @refresh="statsTableRef.getStatsData(true)"
      :loading="statsTableRef?.loading"
      v-model="networks"
    ></networkFilter>
    <statsTable :networks="networks" ref="statsTableRef"></statsTable>
  </v-col>
</template>

<script lang="ts" setup>
import { Network } from "@threefold/gridproxy_client";
import { type Ref, ref } from "vue";

import networkFilter from "../components/network_filter.vue";
import statsTable from "../components/stats_table.vue";

const statsTableRef = ref();
const networks = ref() as Ref<Network[]>;
</script>
<script lang="ts">
export default {
  components: { networkFilter, statsTable },
  name: "StatisticsView",
};
</script>
