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
import { Network, type Stats } from "@threefold/gridproxy_client";
import { onMounted, ref } from "vue";

import type { IStatistics } from "../types/index";
import { fetchStats } from "../utils/fetchData";
import { formatData } from "../utils/formatData";
import toTeraOrGigaOrPeta from "../utils/toTeraOrGegaOrPeta";
import StatisticsCard from "./statistics_card.vue";
const loading = ref(true);
const failed = ref(false);

const Istats = ref<IStatistics[]>([]);
const nodesDistribution = ref<string>("");

let stats: Stats | null = null;
let networks: Network[] = [];
const getStats = async () => {
  networks = [Network.Dev, Network.Main, Network.Test];
  try {
    loading.value = true;
    failed.value = false;
    const data = await fetchStats(networks);
    return formatData(networks, data);
  } catch (error) {
    failed.value = true;
    return null;
  } finally {
    loading.value = false;
  }
};

const fetchData = async () => {
  try {
    stats = await getStats();
    if (!loading.value && stats != null) {
      nodesDistribution.value = JSON.stringify(stats.nodesDistribution);
      Istats.value = [
        { data: stats.nodes, title: "Nodes Online", icon: "mdi-laptop" },
        { data: stats.farms, title: "Farms", icon: "mdi-tractor" },
        { data: stats.countries, title: "Countries", icon: "mdi-earth" },
        { data: stats.totalCru, title: "CPUs", icon: "mdi-cpu-64-bit" },
        { data: toTeraOrGigaOrPeta(stats.totalSru.toString()), title: "SSD Storage", icon: "mdi-nas" },
        { data: toTeraOrGigaOrPeta(stats.totalHru.toString()), title: "HDD Storage", icon: "mdi-harddisk" },
        { data: toTeraOrGigaOrPeta(stats.totalMru.toString()), title: "RAM", icon: "mdi-memory" },
        { data: stats.accessNodes, title: "Access Nodes", icon: "mdi-gate" },
        { data: stats.gateways, title: "Gateways", icon: "mdi-boom-gate-outline" },
        { data: stats.twins, title: "Twins", icon: "mdi-brain" },
        { data: stats.publicIps, title: "Public IPs", icon: "mdi-access-point" },
        { data: stats.contracts, title: "Contracts", icon: "mdi-file-document-edit-outline" },
      ];
      loading.value = false;
    }
  } catch (error) {
    console.error("Error in fetchData:", error);
  }
};

onMounted(fetchData);
</script>
<script lang="ts">
export default {
  name: "StatsTable",
};
</script>
