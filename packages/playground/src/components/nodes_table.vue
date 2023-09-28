<template>
  <div class="pt-5">
    <v-card>
      <v-tabs v-model="activeTab" align-tabs="center">
        <v-tab v-for="(tab, index) in tabs" :key="index" :value="index" color="primary" class="pr-8">
          {{ tab.label }}
        </v-tab>
      </v-tabs>

      <v-window v-model="activeTab">
        <nodes-table :tab="activeTab" />
      </v-window>
    </v-card>
  </div>
  <div class="pt-5">
    <v-card class="pa-5">
      <v-data-table
        :headers="headers"
        :items="nodes"
        :server-items-length="nodesCount"
        :loading="loading"
        loading-text="loading dedicated nodes ..."
        show-expand
        class="elevation-1"
        :disable-sort="true"
        :expanded.sync="expanded"
        hover
        :items-per-page="pageSize"
        :footer-props="{
          'items-per-page-options': [5, 10, 15, 50],
        }"
      >
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { NodeStatus } from "@threefold/gridproxy_client";
import { onMounted, ref, watch } from "vue";

import { gridProxyClient } from "../clients";
import { useProfileManager } from "../stores";
import type { VDataTableHeader } from "../types";
import { getGrid } from "../utils/grid";
import toTeraOrGigaOrPeta from "../utils/toTeraOrGegaOrPeta";

const headers: VDataTableHeader = [
  { title: "Node ID", key: "nodeId" },
  { title: "Location", key: "location.country", sortable: false },
  { title: "CRU", key: "total_resources.cru" },
  { title: "MRU", key: "total_resources.mru", value: item => toTeraOrGigaOrPeta(item.total_resources.mru) },
  { title: "SRU", key: "total_resources.sru", value: item => toTeraOrGigaOrPeta(item.total_resources.sru) },
  { title: "HRU", key: "total_resources.hru", value: item => toTeraOrGigaOrPeta(item.total_resources.hru) },
  { title: "GPU", key: "num_gpu" },
  {
    title: "Price (USD)",
    key: "price",
  },
  { title: "Actions", key: "actions", sortable: false },
];
const profileManager = useProfileManager();
const pageSize = ref(10);
const expanded = ref();
const tabs = [{ label: "Rentable" }, { label: "Rented" }, { label: "Mine" }];
const activeTab = ref(0);
const loading = ref(false);
const nodes = ref();
const nodesCount = ref(0);

onMounted(async () => {
  loadData();
});

async function loadData() {
  //TODO: add try w catch
  //TODO: add discount
  if (activeTab.value === 0) {
    loading.value = true;
    const data = await gridProxyClient.nodes.list({
      rentable: true,
      status: NodeStatus.Up,
      retCount: true,
      size: pageSize.value,
    });
    nodes.value = data.data;
    for (const item of nodes.value) {
      item.price = await calculatePrice(
        item.total_resources.cru,
        item.total_resources.mru,
        item.total_resources.sru,
        item.total_resources.hru,
        item.publicConfig.ipv4,
      );
    }
    nodesCount.value = data.count ?? 0;
    loading.value = false;
  }

  if (activeTab.value === 1) {
    loading.value = true;
    const data = await gridProxyClient.nodes.list({
      rented: true,
      status: NodeStatus.Up,
      retCount: true,
      size: pageSize.value,
    });
    nodes.value = data.data;
    nodesCount.value = data.count ?? 0;
    loading.value = false;
  }

  if (activeTab.value === 2) {
    loading.value = true;
    const data = await gridProxyClient.nodes.list({
      rented: true,
      rentedBy: profileManager.profile?.twinId,
      retCount: true,
      size: pageSize.value,
    });
    nodes.value = data.data;
    nodesCount.value = data.count ?? 0;
    loading.value = false;
  }
}

//TODO: handling TB && discounts
async function calculatePrice(cru: string, mru: string, sru: string, hru: string, ipv4: string) {
  const grid = await getGrid(profileManager.profile!);
  const mruGB = toTeraOrGigaOrPeta(mru);
  const hruGB = toTeraOrGigaOrPeta(hru);
  const sruGB = toTeraOrGigaOrPeta(sru);

  try {
    const price = await grid?.calculator.calculate({
      cru: +cru,
      hru: +hruGB.replace(/\s*(GB|TB)$/, ""),
      ipv4u: ipv4 !== "",
      mru: +mruGB.replace(/\s*(GB|TB)$/, ""),
      sru: +sruGB.replace(/\s*(GB|TB)$/, ""),
    });

    return price?.dedicatedPrice;
  } catch (e) {
    console.log("Error calculating price: ", e);
  }
}

watch(activeTab, () => {
  loadData();
});
</script>

<script lang="ts">
export default {
  name: "Dedicated Node",
  components: {},
};
</script>
