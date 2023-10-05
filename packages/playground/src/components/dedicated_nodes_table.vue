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
      <v-data-table-server
        :loading="loading"
        :items-length="nodesCount"
        loading-text="Loading nodes..."
        :headers="headers"
        :items="nodes"
        v-model:items-per-page="pageSize"
        v-model:expanded="expanded"
        show-expand
        class="elevation-1"
        :hover="true"
        :items-per-page-options="[
          { value: 5, title: '5' },
          { value: 10, title: '10' },
          { value: 15, title: '15' },
          { value: 50, title: '50' },
        ]"
        v-model:page="page"
        return-object
      >
        <template v-slot:[`item.actions`]="{ item }">
          <reserve-btn
            :node-id="item.raw.nodeId"
            :rented-by-twin-id="item.raw.rentedByTwinId"
            :twin-id="(profileManager.profile?.twinId as number)"
            @updateTable="reloadTable"
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
      </v-data-table-server>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { NodeStatus } from "@threefold/gridproxy_client";
import { onMounted, ref, watch } from "vue";
import type { VDataTable } from "vuetify/labs/VDataTable";
import { VDataTableServer } from "vuetify/labs/VDataTable";

import { gridProxyClient } from "../clients";
import { useProfileManager } from "../stores";
import { getGrid, loadBalance } from "../utils/grid";
import toTeraOrGigaOrPeta from "../utils/toTeraOrGegaOrPeta";

const headers: VDataTable["headers"] = [
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
const page = ref(1);
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
  await loadData();
});

async function loadData() {
  const params = tabParams[activeTab.value as keyof typeof tabParams];

  if (!params) {
    return;
  }

  loading.value = true;
  try {
    const data = await gridProxyClient.nodes.list({
      ...params,
      size: pageSize.value,
      page: page.value,
    });
    const grid = await getGrid(profileManager.profile!);

    const pricePromises = data.data.map(async item => {
      const fee = await grid?.contracts.getDedicatedNodeExtraFee({ nodeId: item.nodeId });

      const price = await calculatePrice(
        item.total_resources.cru,
        item.total_resources.mru,
        item.total_resources.sru,
        item.total_resources.hru,
        item.publicConfig.ipv4,
        item.certificationType,
      );

      return {
        ...item,
        price: (price as { dedicatedPrice?: number } | undefined)?.dedicatedPrice ?? 0 + (fee || 0),
        discount: (price as { sharedPackage: { discount: number } } | undefined)?.sharedPackage.discount || 0,
      };
    });

    const pricedNodes = await Promise.all(pricePromises);
    nodes.value = pricedNodes;

    nodesCount.value = data.count ?? 0;
    loading.value = false;
  } catch (e) {
    console.log("Error: ", e);
  }
}

async function calculatePrice(
  cru: number,
  mru: number,
  sru: number,
  hru: number,
  ipv4: string,
  certificationType: string,
) {
  try {
    const grid = await getGrid(profileManager.profile!);
    const balance = await loadBalance(grid!);
    const ipv4u = ipv4 !== "";
    const certified = certificationType !== "";

    const price = await grid?.calculator.calculateWithMyBalance({
      cru: cru,
      hru: toGigaBytes(hru.toString()),
      ipv4u,
      mru: toGigaBytes(mru.toString()),
      sru: toGigaBytes(sru.toString()),
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

watch(
  [page, pageSize],
  ([newPage, newPageSize]) => {
    page.value = newPage;
    pageSize.value = newPageSize;
    loadData();
  },
  { immediate: true },
);

async function reloadTable() {
  await new Promise(resolve => {
    setTimeout(resolve, 20000);
  });
  await loadData();
}
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
