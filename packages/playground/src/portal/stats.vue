<template>
  <div>
    <v-container class="custom-container">
      <v-row>
        <section class="items" v-if="Istats.length != 0">
          <div v-for="item of Istats" :key="item.title">
            <StatisticsCard :item="item" />
          </div>
        </section>
        <v-col cols="10" class="mx-auto"> <tf-map :nodes="nodesDistribution"></tf-map></v-col>
      </v-row>
      <section class="loader" v-if="Istats.length === 0">
        <v-progress-circular size="150" indeterminate />
      </section>

      <v-divider class="mt-2 mb-2" />
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import axios from "axios";
import { onMounted, ref } from "vue";

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

const req = axios.create({
  baseURL: `${window.env.GRIDPROXY_URL}`,
});

const fetchData = async () => {
  req
    .get("/stats?status=up")
    .then(({ data }) => {
      stats = data;
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
    .catch(() => {
      /* Pass */
    })
    .finally(() => (loading.value = false));
};

onMounted(fetchData);
</script>

<style lang="scss" scoped>
.items {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 15px 16px 0;

  > div {
    padding: 5px;
    width: 16.5%;

    @media (max-width: 1910px) {
      width: calc(100% / 6);
    }

    @media (max-width: 1270px) {
      width: 50%;
    }

    @media (max-width: 800px) {
      width: 100%;
    }
  }
}
</style>
