<template>
  <div>
    <v-container>
      <div class="text-center">
        <v-row align="center" justify="center">
          <v-col cols="12" sm="6" md="4">
            <section class="loader" v-if="loading">
              <v-progress-circular size="150" indeterminate />
            </section>
          </v-col>
        </v-row>
      </div>
      <v-row>
        <v-col color="red" v-if="failed">
          <v-alert type="error" variant="tonal">
            Failed to get stats data after 3 attempts, Feel free to contact the support team or try again later.
            <v-btn @click="fetchData" color="transparent">
              <v-icon> mdi-refresh</v-icon>
            </v-btn>
          </v-alert>
        </v-col>
        <v-col v-if="Istats.length !== 0" class="d-flex flex-wrap justify-center">
          <v-col v-for="item of Istats" :key="item.title" xl="2" lg="3" md="4" sm="6" cols="12" class="px-2">
            <StatisticsCard :item="item" />
          </v-col>
        </v-col>
        <v-col cols="12" class="mx-auto">
          <tf-map r="125" g="227" b="200" :nodes="nodesDistribution" />
        </v-col>
      </v-row>
      <v-divider class="mt-2 mb-2" />
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
  networks = [Network.Dev];
  try {
    loading.value = true;
    failed.value = false;
    const data = await fetchStats(networks);
    return formatData(networks, data);
  } catch (error) {
    loading.value = false;
    failed.value = true;
    return null;
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
