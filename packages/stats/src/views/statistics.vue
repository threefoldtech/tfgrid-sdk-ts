<template>
  <v-col cols="11" class="mx-auto pt-0">
    <networkFilter
      v-model="networks"
      :loading="statsTableRef?.loading"
      @refresh="statsTableRef.getStatsData(true)"
    ></networkFilter>
    <statsTable ref="statsTableRef" :networks="networks"></statsTable>
  </v-col>
</template>

<script lang="ts" setup>
import { type Ref, ref } from "vue";

import networkFilter from "../components/network_filter.vue";
import statsTable from "../components/stats_table.vue";

const statsTableRef = ref();
const networks = ref() as Ref<string[]>;
</script>
<script lang="ts">
export default {
  name: "StatisticsView",
  components: { networkFilter, statsTable },
};
</script>
