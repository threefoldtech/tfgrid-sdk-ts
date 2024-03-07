<template>
  <div>
    <div class="border px-4 pb-4 rounded position-relative mt-2">
      <v-card color="primary" class="d-flex justify-center items-center mt-3 pa-3 text-center">
        <v-icon size="30" class="pr-3">mdi-resistor-nodes</v-icon>
        <v-card-title class="pa-0" color="white">Dedicated Machines</v-card-title>
      </v-card>

      <TfFiltersContainer class="my-6" @apply="loadNodes" :loading="loading">
        <TfFilter
          query-route="min-cpu"
          v-model="filters.minCPU"
          :rules="[
            validators.isInt('This Field accepts only a valid number.'),
            validators.min('This Field must be a number larger than 0.', 1),
            validators.validateResourceMaxNumber('This value is out of range.'),
          ]"
        >
          <template #input="{ props }">
            <VTextField label="Min CPU (Cores)" variant="outlined" v-model="filters.minCPU" v-bind="props">
              <template #append-inner>
                <VTooltip text="Filter by the minimum total amount of CPU Cores in the node.">
                  <template #activator="{ props }">
                    <VIcon icon="mdi-information-outline" v-bind="props" />
                  </template>
                </VTooltip>
              </template>
            </VTextField>
          </template>
        </TfFilter>

        <TfFilter
          query-route="min-ram"
          v-model="filters.minRAM"
          :rules="[
            validators.isNumeric('This field accepts numbers only.'),
            validators.min('The total ram should be larger than zero.', 1),
            validators.validateResourceMaxNumber('This value is out of range.'),
          ]"
        >
          <template #input="{ props }">
            <VTextField label="Min RAM (GB)" variant="outlined" v-model="filters.minRAM" v-bind="props">
              <template #append-inner>
                <VTooltip text="Filter by the minimum total amount of RAM in the node.">
                  <template #activator="{ props }">
                    <VIcon icon="mdi-information-outline" v-bind="props" />
                  </template>
                </VTooltip>
              </template>
            </VTextField>
          </template>
        </TfFilter>

        <TfFilter
          query-route="min-ssd"
          v-model="filters.minSSD"
          :rules="[
            validators.isNumeric('This field accepts numbers only.'),
            validators.min('The total ssd should be larger than zero.', 1),
            validators.validateResourceMaxNumber('This value is out of range.'),
          ]"
        >
          <template #input="{ props }">
            <VTextField label="Min SSD (GB)" variant="outlined" v-model="filters.minSSD" v-bind="props">
              <template #append-inner>
                <VTooltip text="Filter by the minimum total amount of SSD in the node.">
                  <template #activator="{ props }">
                    <VIcon icon="mdi-information-outline" v-bind="props" />
                  </template>
                </VTooltip>
              </template>
            </VTextField>
          </template>
        </TfFilter>

        <TfFilter
          query-route="min-hdd"
          v-model="filters.minHDD"
          :rules="[
            validators.isNumeric('This field accepts numbers only.'),
            validators.min('The total hdd should be larger than zero.', 1),
            validators.validateResourceMaxNumber('This value is out of range.'),
          ]"
        >
          <template #input="{ props }">
            <VTextField label="Min HDD (GB)" variant="outlined" v-model="filters.minHDD" v-bind="props">
              <template #append-inner>
                <VTooltip text="Filter by the minimum total amount of HDD in the node.">
                  <template #activator="{ props }">
                    <VIcon icon="mdi-information-outline" v-bind="props" />
                  </template>
                </VTooltip>
              </template>
            </VTextField>
          </template>
        </TfFilter>

        <TfFilter
          query-route="gpu-device-name"
          v-model="filters.gpuDeviceName"
          :rules="[
            validators.pattern('GPU\'s device name only accepts letters and numbers.', {
              pattern: /^[A-Za-z0-9[\]/,.]+$/,
            }),
          ]"
        >
          <template #input="{ props }">
            <VTextField label="GPU's device name" variant="outlined" v-model="filters.gpuDeviceName" v-bind="props">
              <template #append-inner>
                <VTooltip text="Filter by GPU's device name.">
                  <template #activator="{ props }">
                    <VIcon icon="mdi-information-outline" v-bind="props" />
                  </template>
                </VTooltip>
              </template>
            </VTextField>
          </template>
        </TfFilter>

        <TfFilter
          query-route="gpu-device-vendor"
          v-model="filters.gpuVendorName"
          :rules="[
            validators.pattern('GPU\'s device vendor only accepts letters and numbers.', {
              pattern: /^[A-Za-z0-9[\]/,.]+$/,
            }),
          ]"
        >
          <template #input="{ props }">
            <VTextField label="GPU's vendor name" variant="outlined" v-model="filters.gpuVendorName" v-bind="props">
              <template #append-inner>
                <VTooltip text="Filter by GPU's vendor name.">
                  <template #activator="{ props }">
                    <VIcon icon="mdi-information-outline" v-bind="props" />
                  </template>
                </VTooltip>
              </template>
            </VTextField>
          </template>
        </TfFilter>

        <TfFilter query-route="gpu" v-model="filters.gpu">
          <v-switch color="primary" inset label="GPU Node (Only)" v-model="filters.gpu" hide-details />
        </TfFilter>
      </TfFiltersContainer>

      <v-alert type="info" variant="tonal">
        Discounts are applied on hourly basis, you need to maintain at least the same balance you have or higher to
        unlock the discounts.
      </v-alert>

      <nodes-table
        @update-active-tab-value="updateActiveTabValue"
        @reload-table="reloadTable"
        @update-options="updateOptions($event)"
        :options="{ page, size }"
        :nodes="nodes"
        :nodes-count="nodesCount"
        :loading="loading"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { NodeStatus } from "@threefold/gridproxy_client";
import { CertificationType } from "@threefold/gridproxy_client";
import { ref } from "vue";

import { gridProxyClient } from "@/clients";
import { useProfileManager } from "@/stores";
import { convert } from "@/utils/get_nodes";
import { getGrid } from "@/utils/grid";
import { toGigaBytes } from "@/utils/helpers";

const loading = ref(false);

const profileManager = useProfileManager();
const activeTab = ref(0);
const nodes = ref<any[]>([]);
const nodesCount = ref(0);

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

const size = ref(window.env.PAGE_SIZE);
const page = ref(1);
const filters = ref({
  minCPU: "",
  minRAM: "",
  minSSD: "",
  minHDD: "",
  gpuDeviceName: "",
  gpuVendorName: "",
  gpu: false,
});

const updateActiveTabValue = (newValue: number) => {
  activeTab.value = newValue;
  loadNodes();
};

function updateOptions(options: { page: number; itemsPerPage: number }) {
  if (options.page !== page.value || options.itemsPerPage !== size.value) {
    (page.value = options.page), (size.value = options.itemsPerPage);
    loadNodes();
  }
}
async function loadNodes() {
  const params = tabParams[activeTab.value as keyof typeof tabParams];

  if (!params) {
    return;
  }

  if (filters.value.minCPU && !Number.isInteger(+filters.value.minCPU)) {
    nodes.value = [];
    nodesCount.value = 0;
    return;
  }

  loading.value = true;

  try {
    const data = await gridProxyClient.nodes.list({
      ...params,
      size: size.value,
      page: page.value,
      totalSru: convert(filters.value.minSSD),
      totalMru: convert(filters.value.minRAM),
      totalHru: convert(filters.value.minHDD),
      totalCru: +filters.value.minCPU || undefined,
      gpuVendorName: filters.value.gpuVendorName || undefined,
      gpuDeviceName: filters.value.gpuDeviceName || undefined,
      hasGpu: filters.value.gpu || undefined,
    });

    if (data.count === 0) {
      loading.value = false;
      nodes.value = [];
      nodesCount.value = 0;
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
        discount: price?.dedicatedPackage.discount,
      };
    });

    const pricedNodes = await Promise.all(pricePromises);
    nodes.value = pricedNodes;

    nodesCount.value = data.count ?? 0;
    loading.value = false;
  } catch (e) {
    console.log("Error: ", e);
    loading.value = false;
  }
}

function reloadTable() {
  setTimeout(loadNodes, 20000);
}
</script>

<script lang="ts">
import NodesTable from "@/dashboard/components/dedicated_nodes_table.vue";

import TfFilter from "../components/filters/TfFilter.vue";
import TfFiltersContainer from "../components/filters/TfFiltersContainer.vue";

export default {
  name: "Dedicated Node",
  components: {
    NodesTable,
    TfFiltersContainer,
    TfFilter,
  },
};
</script>

<style>
.v-data-table__td {
  font-size: 0.875rem;
}

.v-table .v-btn {
  font-size: 0.875rem !important;
}
</style>
