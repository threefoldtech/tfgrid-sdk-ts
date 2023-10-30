<template>
  <!-- Filters -->
  <div class="pt-5">
    <node-filter v-model="filterInputs" v-model:valid="isValidForm" :form-disabled="isFormLoading" />
  </div>
  <div class="pt-5">
    <v-card>
      <v-tabs v-model="activeTab" align-tabs="center">
        <v-tab v-for="(tab, index) in tabs" :key="index" :value="index" color="info">
          {{ tab.label }}
        </v-tab>
      </v-tabs>
    </v-card>
  </div>
  <div>
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
        :hide-no-data="false"
        :disable-sort="true"
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
          <reserve-btn :node="(item.raw as unknown as GridNode)" @updateTable="reloadTable" />
        </template>

        <template v-slot:[`item.price`]="{ item }">
          <v-tooltip bottom color="primary" close-delay="1000">
            <template v-slot:activator="{ isActive, props }">
              <span v-bind="props" v-on="isActive">{{ item.raw.price }} *</span>
            </template>
            <span>
              Discounts: <v-spacer />
              <ul class="pl-2">
                <li>
                  You receive 50% discount if you reserve an entire
                  <a
                    target="_blank"
                    href="https://manual.grid.tf/dashboard/portal/dashboard_portal_dedicated_nodes.html#billing--pricing"
                  >
                    node
                  </a>
                </li>
                <li>
                  You're receiving {{ item.raw.discount }}% discount as per the
                  <a target="_blank" href="https://manual.grid.tf/cloud/cloudunits_pricing.html#staking-discount">
                    <p style="display: inline">discount levels</p>
                  </a>
                </li>
              </ul>
            </span>
          </v-tooltip>
        </template>

        <template v-slot:expanded-row="{ columns, item }">
          <node-details :node="(item.raw as unknown as GridNode)" :columns-len="columns.length" />
        </template>
      </v-data-table-server>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import type { GridNode } from "@threefold/gridproxy_client";
import { NodeStatus } from "@threefold/gridproxy_client";
import { CertificationType } from "@threefold/gridproxy_client";
import { onMounted, ref, watch } from "vue";
import type { VDataTable } from "vuetify/labs/VDataTable";
import { VDataTableServer } from "vuetify/labs/VDataTable";

import { gridProxyClient } from "@/clients";
import { toBytes } from "@/explorer/utils/helpers";
import { useProfileManager } from "@/stores";
import { getGrid } from "@/utils/grid";
import { toGigaBytes } from "@/utils/helpers";
import toTeraOrGigaOrPeta from "@/utils/toTeraOrGegaOrPeta";

const headers: VDataTable["headers"] = [
  { title: "Node ID", key: "nodeId", sortable: false },
  { title: "Location", key: "location.country", sortable: false },
  { title: "CPU", key: "total_resources.cru", sortable: false },
  {
    title: "RAM",
    key: "total_resources.mru",
    value: item => toTeraOrGigaOrPeta(item.total_resources.mru),
    sortable: false,
  },
  {
    title: "SSD",
    key: "total_resources.sru",
    value: item => toTeraOrGigaOrPeta(item.total_resources.sru),
    sortable: false,
  },
  {
    title: "HDD",
    key: "total_resources.hru",
    value: item => toTeraOrGigaOrPeta(item.total_resources.hru),
    sortable: false,
  },
  { title: "GPU", key: "num_gpu", sortable: false },
  {
    title: "Price (USD)",
    key: "price",
    sortable: false,
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
const tabs = [{ label: "Rentable" }, { label: "Mine" }];
const activeTab = ref(0);
const loading = ref(false);
const nodes = ref<any[]>();
const nodesCount = ref(0);
const filterInputs = ref<DedicatedNodeFilters>(DedicatedNodeInitializer);
const isValidForm = ref<boolean>(false);
const isFormLoading = ref<boolean>(true);

const tabParams = {
  0: {
    rentable: true,
    status: NodeStatus.Up,
    retCount: true,
  },
  1: {
    rented: true,
    rentedBy: profileManager.profile?.twinId,
    retCount: true,
  },
};

onMounted(async () => {
  await loadData();
});

const _loadData = async () => {
  const params = tabParams[activeTab.value as keyof typeof tabParams];

  if (!params) {
    return;
  }

  loading.value = true;
  isFormLoading.value = true;
  try {
    const data = await gridProxyClient.nodes.list({
      ...params,
      size: pageSize.value,
      page: page.value,
      totalSru: filterInputs.value.total_sru.value ? toBytes(+filterInputs.value.total_sru.value) : undefined,
      totalMru: filterInputs.value.total_mru.value ? toBytes(+filterInputs.value.total_mru.value) : undefined,
      totalHru: filterInputs.value.total_hru.value ? toBytes(+filterInputs.value.total_hru.value) : undefined,
      totalCru: filterInputs.value.total_cru.value ? +filterInputs.value.total_cru.value : undefined,
      gpuVendorName: filterInputs.value.gpu_vendor_name.value ? filterInputs.value.gpu_vendor_name.value : "",
      gpuDeviceName: filterInputs.value.gpu_device_name.value ? filterInputs.value.gpu_device_name.value : "",
    });

    if (data.count === 0) {
      loading.value = false;
      nodes.value = [];
      nodesCount.value = 0;
      isFormLoading.value = false;
      return;
    }

    const grid = await getGrid(profileManager.profile!);

    const pricePromises = data.data.map(async item => {
      const fee = await grid?.contracts.getDedicatedNodeExtraFee({ nodeId: item.nodeId });
      const price = await grid?.calculator.calculateWithMyBalance({
        cru: item.total_resources.cru,
        hru: toGigaBytes(item.total_resources.hru),
        mru: toGigaBytes(item.total_resources.mru),
        sru: toGigaBytes(item.total_resources.sru),
        ipv4u: false,
        certified: item.certificationType === CertificationType.Certified,
      });
      return {
        ...item,
        price: (price?.dedicatedPrice ?? 0 + (fee || 0)).toFixed(3),
        discount: price?.sharedPackage.discount ?? 0,
      };
    });

    const pricedNodes = await Promise.all(pricePromises);
    nodes.value = pricedNodes;

    nodesCount.value = data.count ?? 0;
    loading.value = false;
    isFormLoading.value = false;
  } catch (e) {
    console.log("Error: ", e);
    loading.value = false;
    isFormLoading.value = false;
  }
};

const loadData = debounce(_loadData, 1000);

watch(activeTab, async () => {
  await loadData();
});

watch(
  [page, pageSize, isValidForm, filterInputs],
  async ([newPage, newPageSize, newIsValidForm]) => {
    page.value = newPage;
    pageSize.value = newPageSize;
    if (newIsValidForm) {
      await loadData();
    }
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
import { debounce } from "lodash";

import NodeFilter from "@/components/node_filter.vue";
import { type DedicatedNodeFilters, DedicatedNodeInitializer } from "@/utils/filter_nodes";

import NodeDetails from "./node_details.vue";
import ReserveBtn from "./reserve_action_btn.vue";

export default {
  name: "Dedicated Node",
  components: {
    ReserveBtn,
    NodeDetails,
    NodeFilter,
  },
};
</script>

<style>
.v-table__wrapper {
  min-height: 100px;
}

.v-tooltip > .v-overlay__content {
  pointer-events: initial !important;
}
</style>
