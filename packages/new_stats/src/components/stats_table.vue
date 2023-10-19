<template>
  <div>
    <v-sheet color="transparent" height="100vh" v-if="loading" class="d-flex align-center justify-center">
      <v-container class="text-center d-block">
        <v-progress-circular size="40" indeterminate />
        <p class="pt-4 font-weight-bold">Loading stats data</p>
      </v-container>
    </v-sheet>
    <v-container fluid class="py-0 pt-4 ml-2 d-flex justify-center" v-else>
      <v-row class="w-100">
        <!-- <v-col color="red" v-if="failed">
          <v-alert type="error" variant="tonal">
            Failed to get stats data after 3 attempts, Feel free to contact the support team or try again later.
            <v-btn @click="fetchData" color="transparent">
              <v-icon> mdi-refresh</v-icon>
            </v-btn>
          </v-alert>
        </v-col> -->
        <v-col xl="8" lg="8" md="12" cols="12" class="mt-4 pb-0 px-0">
          <tf-map r="125" g="227" b="200" :nodes="nodesDistribution" />
        </v-col>
        <div style="height: 80vhd" class="my-auto">
          <v-divider :thickness="2" class="border-opacity-50" color="gray" vertical></v-divider>
        </div>

        <v-col v-if="Istats.length !== 0" class="d-flex flex-wrap justify-center pt-6 pb-0 px-0">
          <v-col
            v-for="item of Istats"
            :key="item.title"
            xl="5"
            lg="5"
            md="3"
            sm="4"
            xs="4"
            cols="12"
            class="text-center pt-1 pb-0"
          >
            <StatisticsCard :item="item" />
          </v-col>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import { Network } from "@threefold/gridproxy_client";
import { storeToRefs } from "pinia";
import { computed, ref, watch } from "vue";

import { useStatsStore } from "../store/stats/index";
import type { IStatistics, NetworkStats } from "../types/index";
import { formatData } from "../utils/formatData";
import toTeraOrGigaOrPeta from "../utils/toTeraOrGegaOrPeta";
import StatisticsCard from "./statistics_card.vue";
const $store = useStatsStore();
const { getNetworkStats } = storeToRefs($store);
const networkStats = computed((): NetworkStats => {
  return {
    dev: getNetworkStats.value(Network.Dev),
    main: getNetworkStats.value(Network.Main),
    test: getNetworkStats.value(Network.Test),
  };
});

const props = defineProps({
  networks: {
    type: Object,
    require: true,
  },
});
async function getStatsData(refresh = false) {
  if (props.networks) {
    props.networks.forEach(async (network: Network) => {
      if (!networkStats.value[network] || refresh)
        try {
          loading.value = true;
          await $store.getStats(network.toLowerCase() as Network);
        } catch (error) {
          console.log(error);
        } finally {
          loading.value = false;
        }
    });
  }
}
watch(
  () => props.networks,
  async () => await getStatsData(),
  { deep: true },
);
const loading = ref(true);
defineExpose({ loading, getStatsData });
const failed = ref(false);

const Istats = computed((): IStatistics[] => {
  {
    return [
      { data: stats.value.nodes, title: "Nodes Online", icon: "mdi-laptop" },
      { data: stats.value.farms, title: "Farms", icon: "mdi-tractor" },
      { data: stats.value.countries, title: "Countries", icon: "mdi-earth" },
      { data: stats.value.totalCru, title: "CPUs", icon: "mdi-cpu-64-bit" },
      { data: toTeraOrGigaOrPeta(stats.value.totalSru.toString()), title: "SSD Storage", icon: "mdi-nas" },
      { data: toTeraOrGigaOrPeta(stats.value.totalHru.toString()), title: "HDD Storage", icon: "mdi-harddisk" },
      { data: toTeraOrGigaOrPeta(stats.value.totalMru.toString()), title: "RAM", icon: "mdi-memory" },
      { data: stats.value.accessNodes, title: "Access Nodes", icon: "mdi-gate" },
      { data: stats.value.gateways, title: "Gateways", icon: "mdi-boom-gate-outline" },
      { data: stats.value.twins, title: "Twins", icon: "mdi-brain" },
      { data: stats.value.publicIps, title: "Public IPs", icon: "mdi-access-point" },
      { data: stats.value.contracts, title: "Contracts", icon: "mdi-file-document-edit-outline" },
    ];
  }
});

const nodesDistribution = computed(() => JSON.stringify(stats.value.nodesDistribution));

const stats = computed(() => {
  return formatData(props.networks as Network[], networkStats.value);
});
</script>
<script lang="ts">
export default {
  name: "StatsTable",
};
</script>
