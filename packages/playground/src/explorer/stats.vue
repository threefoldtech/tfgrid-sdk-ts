<template>
  <div>
    <div class="border px-4 pb-4 rounded position-relative mt-2">
      <v-card color="primary" class="d-flex justify-center items-center mt-3 pa-3 text-center">
        <v-icon size="30" class="pr-3" color="white">mdi-chart-scatter-plot</v-icon>
        <v-card-title class="pa-0">statistics</v-card-title>
      </v-card>
      <div class="text-center">
        <v-row align="center" justify="center">
          <v-col cols="12" sm="6" md="4">
            <section class="loader" v-if="loading">
              <v-progress-circular size="150" indeterminate />
            </section>
          </v-col>
        </v-row>
      </div>
      <v-card class="pa-5">
        <v-row>
          <v-col color="red" v-if="failed">
            <v-alert type="error" variant="tonal">
              Failed to get stats data after 3 attempts, Feel free to contact the support team or try again later.
              <v-btn @click="fetchData" color="transparent">
                <v-icon> mdi-refresh</v-icon>
              </v-btn>
            </v-alert>
          </v-col>
          <v-col cols="12" sm="12" md="12" lg="8" class="mx-auto mt-3">
            <tf-map r="125" g="227" b="200" :nodes="nodesDistribution" />
          </v-col>
          <v-divider class="v-divider--vertical mx-2 my-4" />
          <v-col v-if="Istats.length !== 0" class="d-flex flex-wrap justify-center">
            <v-col v-for="item of Istats" :key="item.title" xl="6" lg="6" md="4" sm="12" cols="12" class="px-2 py-0">
              <StatisticsCard :item="item" />
            </v-col>
          </v-col>
        </v-row>
      </v-card>
      <!-- <v-divider class="mt-4 mb-2" /> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NodeStatus, type Stats } from "@threefold/gridproxy_client";
import { onMounted, ref } from "vue";

import { gridProxyClient } from "../clients";
import StatisticsCard from "../components/statistics_card.vue";
import type { IStatistics as IStatistics } from "../types";
import toTeraOrGigaOrPeta from "../utils/toTeraOrGegaOrPeta";

const loading = ref(true);
const failed = ref(false);

const Istats = ref<IStatistics[]>([]);
const nodesDistribution = ref<string>("");

let stats: Stats | null | undefined = null;

const fetchStats = async () => {
  let retryCount = 0;

  const fetchDataWithRetry = async (): Promise<Stats | undefined> => {
    try {
      loading.value = true;
      failed.value = false;
      const data = await gridProxyClient.stats.get({ status: NodeStatus.Up });
      return data;
    } catch (error) {
      if (retryCount < 3) {
        console.log("Error fetching stats:", error);
        retryCount++;
        console.log(`Retrying in 1 second...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchDataWithRetry();
      } else {
        loading.value = false;
        failed.value = true;
      }
    }
  };

  return fetchDataWithRetry();
};

const fetchData = async () => {
  try {
    stats = await fetchStats();
    if (!loading.value || stats != null) {
      nodesDistribution.value = JSON.stringify(stats!.nodesDistribution);
      Istats.value = [
        { data: stats!.nodes, title: "Nodes Online", icon: "mdi-laptop" },
        { data: stats!.farms, title: "Farms", icon: "mdi-tractor" },
        { data: stats!.countries, title: "Countries", icon: "mdi-earth" },
        { data: stats!.totalCru, title: "CPUs", icon: "mdi-cpu-64-bit" },
        { data: toTeraOrGigaOrPeta(stats!.totalSru.toString()), title: "SSD Storage", icon: "mdi-nas" },
        { data: toTeraOrGigaOrPeta(stats!.totalHru.toString()), title: "HDD Storage", icon: "mdi-harddisk" },
        { data: toTeraOrGigaOrPeta(stats!.totalMru.toString()), title: "RAM", icon: "mdi-memory" },
        { data: stats!.accessNodes, title: "Access Nodes", icon: "mdi-gate" },
        { data: stats!.gateways, title: "Gateways", icon: "mdi-boom-gate-outline" },
        { data: stats!.twins, title: "Twins", icon: "mdi-brain" },
        { data: stats!.publicIps, title: "Public IPs", icon: "mdi-access-point" },
        { data: stats!.contracts, title: "Contracts", icon: "mdi-file-document-edit-outline" },
      ];
      loading.value = false;
    }
  } catch (error) {
    console.error("Error in fetchData:", error);
  }
};

onMounted(fetchData);
</script>
