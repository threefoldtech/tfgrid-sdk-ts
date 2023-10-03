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
        show-expand
        class="elevation-1"
        :disable-sort="true"
        hover
        :items-per-page="pageSize"
        :footer-props="{
          'items-per-page-options': [5, 10, 15, 50],
        }"
        v-model:expanded="expanded"
        return-object
      >
        <template v-slot:[`item.actions`]="{ item }">
          <reserve-btn
            :node-id="item.raw.nodeId"
            :rented-by-twin-id="item.raw.rentedByTwinId"
            :twin-id="(profileManager.profile?.twinId as number)"
          ></reserve-btn>
        </template>

        <template v-slot:[`item.price`]="{ item }">
          <v-tooltip bottom color="primary" close-delay="1000">
            <template v-slot:activator="{ isActive, props }">
              <span v-bind="props" v-on="isActive">{{ item.raw.price }} *</span>
            </template>
            <span
              >Discounts: <br />
              <ul class="pl-2">
                <li>
                  You receive 50% discount if you reserve an entire
                  <a
                    target="_blank"
                    href="https://manual.grid.tf/dashboard/portal/dashboard_portal_dedicated_nodes.html#billing--pricing"
                    style="color: primary"
                    >node</a
                  >
                </li>
                <li>
                  You're receiving {{ item.raw.discount }}% discount as per the
                  <a target="_blank" href="https://manual.grid.tf/cloud/cloudunits_pricing.html#discount-levels">
                    <p style="color: primary; display: inline">discount levels</p>
                  </a>
                </li>
              </ul>
            </span>
          </v-tooltip>
        </template>

        <template v-slot:expanded-row="{ columns, item }">
          <node-details :item="item" :columns-len="columns.length"></node-details>
        </template>
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
import { getGrid, loadBalance } from "../utils/grid";
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
  {
    title: "Actions",
    key: "actions",
    sortable: false,
  },
];
const profileManager = useProfileManager();
const pageSize = ref(10);
const expanded = ref([]);
const tabs = [{ label: "Rentable" }, { label: "Rented" }, { label: "Mine" }];
const activeTab = ref(0);
const loading = ref(false);
const nodes = ref<any[]>();
const nodesCount = ref(0);
const tabParams = {
  0: {
    rentable: true,
    status: NodeStatus.Up,
    retCount: true,
  },
  1: {
    rented: true,
    status: NodeStatus.Up,
    retCount: true,
  },
  2: {
    rented: true,
    rentedBy: profileManager.profile?.twinId,
    retCount: true,
  },
};

onMounted(async () => {
  loadData();
});
//TODO: How to handle page
//TODO: refresh after any transaction

async function loadData() {
  const params = tabParams[activeTab.value as keyof typeof tabParams];

  if (!params) {
    return;
  }

  loading.value = true;
  const data = await gridProxyClient.nodes.list({
    ...params,
    size: pageSize.value,
  });

  nodes.value = data.data;

  for (const item of nodes.value) {
    const price = await calculatePrice(
      item.total_resources.cru,
      item.total_resources.mru,
      item.total_resources.sru,
      item.total_resources.hru,
      item.publicConfig.ipv4,
      item.certificationType,
    );
    item.price =
      (price as { dedicatedPrice: number } | undefined)?.dedicatedPrice ||
      0 + (parseFloat(item.extraFee) ? parseFloat(item.extraFee) / 1000 : 0);
    item.discount = (price as { sharedPackage: { discount: number } } | undefined)?.sharedPackage.discount || 0;
  }

  nodesCount.value = data.count ?? 0;
  loading.value = false;
}

async function calculatePrice(
  cru: string,
  mru: string,
  sru: string,
  hru: string,
  ipv4: string,
  certificationType: string,
) {
  try {
    const grid = await getGrid(profileManager.profile!);
    const balance = await loadBalance(grid!);
    const ipv4u = ipv4 !== "";
    const certified = certificationType !== "";

    const price = await grid?.calculator.calculateWithMyBalance({
      cru: +cru,
      hru: toGigaBytes(hru),
      ipv4u,
      mru: toGigaBytes(mru),
      sru: toGigaBytes(sru),
      balance: balance.free,
      certified: certified,
    });

    return price;
  } catch (e) {
    console.log("Error calculating price: ", e);
    return 0;
  }
}

function toGigaBytes(value?: string) {
  const giga = 1024 ** 3;

  if (!value) return 0;

  const val = +value;
  if (val === 0 || isNaN(val)) return 0;

  const gb = val / giga;
  return parseFloat(gb.toFixed(2));
}

watch(activeTab, () => {
  loadData();
});
</script>

<script lang="ts">
import NodeDetails from "../components/node_details.vue";
import ReserveBtn from "../components/reserve_action_btn.vue";
export default {
  name: "Dedicated Node",
  components: {
    ReserveBtn,
    NodeDetails,
  },
};
</script>
