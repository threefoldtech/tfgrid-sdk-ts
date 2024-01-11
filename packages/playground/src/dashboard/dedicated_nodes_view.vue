<template>
  <div>
    <div class="border px-4 pb-4 rounded position-relative mt-2">
      <v-card color="primary" class="d-flex justify-center items-center mt-3 pa-3 text-center">
        <v-icon size="30" class="pr-3">mdi-resistor-nodes</v-icon>
        <v-card-title class="pa-0" color="white">Dedicated Machines</v-card-title>
      </v-card>
      <!-- Filters -->
      <div class="pt-5">
        <filters
          v-model:model-value="filterInputs"
          v-model:valid="isValidForm"
          :loading="loading"
          :options="filterOptions"
          @apply="applyFilters"
          @reset="resetFilters"
          @update:values="updateValues"
        >
          <template #options="{ props }">
            <v-col v-bind="props">
              <input-tooltip inline tooltip="Enable filtering the nodes that have GPU card supported only.">
                <v-switch
                  color="primary"
                  inset
                  label="GPU Node (Only)"
                  v-model="filterOptions.gpu"
                  hide-details
                  :disabled="isFormLoading"
                />
              </input-tooltip>
            </v-col>
          </template>
        </filters>
      </div>

      <!-- Table -->
      <v-alert type="info" variant="tonal">
        Discounts are applied on hourly basis, you need to maintain at least the same balance you have or higher to
        unlock the discounts.
      </v-alert>
      <nodes-table
        @update-active-tab-value="updateActiveTabValue"
        @reload-table="reloadTable"
        :options="filterOptions"
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
import { onMounted, ref, watch } from "vue";

import { gridProxyClient } from "@/clients";
import { useProfileManager } from "@/stores";
import { type FilterOptions, optionsInitializer } from "@/types";
import { type DedicatedNodeFilters, DedicatedNodeInitializer } from "@/utils/filter_nodes";
import { convert } from "@/utils/get_nodes";
import { getGrid } from "@/utils/grid";
import { toGigaBytes } from "@/utils/helpers";

const isValidForm = ref<boolean>(false);
const filterInputs = ref<DedicatedNodeFilters>(DedicatedNodeInitializer());
const filterOptions = ref<FilterOptions>(optionsInitializer(undefined, undefined, undefined));

const isFormLoading = ref<boolean>(true);
const filtering = ref(false);
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

const applyFilters = async (filtersInputValues: DedicatedNodeFilters) => {
  filtering.value = true;
  filterInputs.value = filtersInputValues;
  filterOptions.value = optionsInitializer(undefined, filterOptions.value.gpu, filterOptions.value.gateway);
  if (isValidForm.value) {
    await _loadData();
  }
  filtering.value = false;
};

const updateActiveTabValue = (newValue: number) => {
  activeTab.value = newValue;
};

const _loadData = async () => {
  const params = tabParams[activeTab.value as keyof typeof tabParams];

  if (!params) {
    return;
  }

  loading.value = true;
  isFormLoading.value = true;
  try {
    const totalCruValue = filterInputs.value.total_cru.value;
    if (totalCruValue !== undefined && !Number.isInteger(+totalCruValue)) {
      loading.value = false;
      nodes.value = [];
      nodesCount.value = 0;
      isFormLoading.value = false;
      return;
    }
    const data = await gridProxyClient.nodes.list({
      ...params,
      size: filterOptions.value.size,
      page: filterOptions.value.page,
      totalSru: convert(filterInputs.value.total_sru.value),
      totalMru: convert(filterInputs.value.total_mru.value),
      totalHru: convert(filterInputs.value.total_hru.value),
      totalCru: totalCruValue ? +totalCruValue : undefined,
      gpuVendorName: filterInputs.value.gpu_vendor_name.value || "",
      gpuDeviceName: filterInputs.value.gpu_device_name.value || "",
      hasGpu: filterOptions.value.gpu,
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

async function reloadTable() {
  await new Promise(resolve => {
    setTimeout(resolve, 20000);
  });
  await _loadData();
}

onMounted(async () => {
  await _loadData();
});

const resetFilters = async (filtersInputValues: DedicatedNodeFilters, reload: boolean) => {
  filtering.value = true;
  filterInputs.value = filtersInputValues;
  filterOptions.value = optionsInitializer(undefined, undefined, undefined);
  if (reload && isValidForm.value) {
    await _loadData();
  }
  filtering.value = false;
};

const updateValues = (label: string, value: string) => {
  if (label in filterOptions.value) {
    Reflect.set(
      filterOptions.value,
      label,
      value === "true" ? true : value === "false" ? false : (value as unknown as boolean),
    );
  } else {
    const inputLabel = label as keyof typeof filterInputs.value;
    filterInputs.value[inputLabel].value = value;
  }
};

watch(
  [activeTab],
  async () => {
    if (!filtering.value) {
      await _loadData();
    }
  },
  { deep: true },
);

watch(
  () => ({ ...filterOptions.value }),
  async (newValue: FilterOptions, oldVal: FilterOptions) => {
    if (oldVal.page != newValue.page || oldVal.size != newValue.size) {
      loading.value = isFormLoading.value = true;
      await _loadData();
      loading.value = isFormLoading.value = false;
    }
  },
);
</script>

<script lang="ts">
import Filters from "@/components/filter.vue";
import NodesTable from "@/dashboard/components/dedicated_nodes_table.vue";

export default {
  name: "Dedicated Node",
  components: {
    NodesTable,
    Filters,
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
