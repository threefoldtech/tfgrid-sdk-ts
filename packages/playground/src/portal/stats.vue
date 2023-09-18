<template>
  <div>
    <v-container>
      <v-row>
        <v-col v-if="Istats.length !== 0" class="d-flex flex-wrap justify-center">
          <v-col v-for="item of Istats" :key="item.title" cols="6" md="2" sm="4" xs="12" class="px-2">
            <StatisticsCard :item="item" />
          </v-col>
        </v-col>

        <v-col v-else cols="12" class="mx-auto">
          <tf-map color="primary" :nodes="nodesDistribution" />
        </v-col>
      </v-row>
      <section class="loader" v-if="Istats.length === 0">
        <v-progress-circular size="150" indeterminate />
      </section>

      <v-divider class="mt-2 mb-2" />
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import { NodeStatus } from "tf_gridproxy_client";
import { onMounted, ref } from "vue";

import { gridProxyClient } from "../clients";
import StatisticsCard from "../components/statistics_card.vue";
import type { IStatistics as IStatistics } from "../types";
import toTeraOrGigaOrPeta from "../utils/toTeraOrGegaOrPeta";

interface Stats {
  nodes: number;
  farms: number;
  countries: number;
  totalCru: number;
  totalSru: number;
  totalMru: number;
  totalHru: number;
  publicIps: number;
  accessNodes: number;
  gateways: number;
  twins: number;
  contracts: number;
  nodesDistribution: { [key: string]: number };
}

const loading = ref(true);
const Istats = ref<IStatistics[]>([]);
const nodesDistribution = ref<string>("");

let stats: Stats | null = null;

const fetchData = async () => {
  gridProxyClient.stats
    .get({ status: NodeStatus.Up })
    .then(async (result: any) => {
      stats = result;
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
      }
    })
    .catch((error: any) => {
      console.error("Error fetching stats:", error);
    })
    .finally(() => {
      loading.value = false;
    });
};

onMounted(fetchData);
</script>
