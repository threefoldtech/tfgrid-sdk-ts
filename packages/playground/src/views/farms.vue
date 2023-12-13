<template>
  <view-layout>
    <v-row>
      <v-col>
        <filters
          v-model="filterFarmInputs"
          @update:model-value="inputFiltersReset"
          :form-disabled="isFormLoading"
          v-model:valid="isValidForm"
        />

        <v-data-table-server
          :loading="loading"
          :headers="headers"
          :items="farms"
          :items-length="totalFarms"
          :items-per-page-options="[
            { value: 5, title: '5' },
            { value: 10, title: '10' },
            { value: 15, title: '15' },
          ]"
          v-model:items-per-page="size"
          v-model:page="page"
          v-model:sort-by="sortBy"
          class="elevation-1"
          @update:options="updateQueries"
          @click:row="openSheet"
        >
          <template #loading />
        </v-data-table-server>
      </v-col>
    </v-row>
    <v-dialog v-model="dialog" hide-overlay transition="dialog-bottom-transition">
      <v-container>
        <v-toolbar :height="35">
          <div class="d-flex justify-center">
            <v-btn icon dark @click="() => (dialog = false)">
              <v-icon size="20s">mdi-close</v-icon>
            </v-btn>
          </div>
        </v-toolbar>

        <template v-if="loading">
          <div color="transparent" class="text-center">
            <v-progress-circular color="primary" indeterminate :size="50" :width="5" />
            <p>Loading farm details...</p>
          </div>
        </template>

        <template v-else>
          <v-card>
            <v-col>
              <farm-details-card :farm="selectedFarm" />
            </v-col>
            <v-col>
              <twin-details-card :farm="selectedFarm" />
            </v-col>
          </v-card>
        </template>
      </v-container>
    </v-dialog>
  </view-layout>
</template>

<script lang="ts" setup>
import type { Farm } from "@threefold/gridproxy_client";
import debounce from "lodash/debounce.js";
import { computed, onMounted, ref, watch } from "vue";

import type { VDataTableHeader } from "@/types";
import type { FarmFilterOptions, MixedFarmFilter } from "@/types";
import type { FilterFarmInputs } from "@/utils/filter_farms";
import { inputsInitializer } from "@/utils/filter_farms";
import { getAllFarms, getFarmQueries } from "@/utils/get_farms";
const loading = ref<boolean>(false);
const farms = ref<Farm[]>();

const selectedFarm = ref<Farm>();
const filterFarmInputs = ref<FilterFarmInputs>(inputsInitializer());
const size = ref(10);
const page = ref(1);
const dialog = ref(false);
const sortBy = ref([{ key: "", order: undefined }]);
const filterOptions = ref<FarmFilterOptions>({
  size: size.value,
  page: page.value,
  sortBy: sortBy.value,
});

const mixedFarmFilters = computed<MixedFarmFilter>(() => ({
  inputs: filterFarmInputs.value,
  options: filterOptions.value,
}));

const isFormLoading = ref<boolean>(true);
const isValidForm = ref<boolean>(false);
const totalFarms = ref(0);

const _getFarms = async (queries: Partial<FarmsQuery>) => {
  if (isValidForm.value) {
    loading.value = true;
    isFormLoading.value = true;
    try {
      const { count, data } = await getAllFarms(queries);

      if (data) {
        totalFarms.value = count || 0;
        farms.value = data.map(farm => {
          const ips = farm.publicIps;
          const total = ips.length;
          const used = ips.filter(x => x.contract_id !== 0).length;
          return {
            ...farm,
            totalPublicIp: total,
            freePublicIp: total - used,
          };
        });
        if (sortBy.value[0]) {
          updateSorting();
        }
      }
    } catch (err) {
      console.log("could not get farms:", err);
      createCustomToast("Failed to get farms!", ToastType.danger);
    } finally {
      isFormLoading.value = false;
      loading.value = false;
    }
  }
};
onMounted(async () => {
  await updateFarms();
});

const request = debounce(_getFarms, 1000);

const updateFarms = async () => {
  const queries = await getFarmQueries(mixedFarmFilters.value);

  await request(queries);
};

const updateSorting = () => {
  if (mixedFarmFilters.value.options) {
    if (mixedFarmFilters.value.options.sortBy?.length) {
      if (sortBy.value[0] && sortBy.value[0]) {
        const sortKey = sortBy.value[0].key;
        const sortOrder = sortBy.value[0].order;
        if (sortKey && sortOrder && farms.value) {
          farms.value.sort((a, b) => {
            let aValue: any, bValue: any;
            if (sortKey == "farmId") {
              aValue = a.farmId;
              bValue = b.farmId;
            } else {
              aValue = a.name;
              bValue = b.name;
            }

            if (typeof aValue == "string" && typeof bValue == "string") {
              return sortOrder === "desc" ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
            }
            return sortOrder === "desc" ? bValue - aValue : aValue - bValue;
          });
        }
      }
    }
  }
};
const updateQueries = async () => {
  const inputs = mixedFarmFilters.value.inputs;
  if (inputs && filterFarmInputs.value) {
    const filtersInputValues = filterFarmInputs.value;
    if (filtersInputValues.farmId) {
      inputs.farmId.value = filtersInputValues.farmId.value;
    }
    if (filtersInputValues.name) {
      inputs.name.value = filtersInputValues.name.value;
    }
    if (filtersInputValues.freeIps) {
      inputs.freeIps.value = filtersInputValues.freeIps.value;
    }
  }
  const options = mixedFarmFilters.value.options;
  if (options) {
    options.page = page.value;
    options.size = size.value;
    options.sortBy = sortBy.value;
  }
  await updateFarms();
};

watch(mixedFarmFilters, updateFarms, { deep: true });
watch(filterFarmInputs, updateQueries, { deep: true });
watch(page, updateQueries);
watch(size, updateQueries);

// The filters should reset to the default value again..
const inputFiltersReset = (filtersInputValues: FilterFarmInputs) => {
  filterFarmInputs.value = filtersInputValues;
  filterOptions.value = {
    page: 1,
    size: 10,
    sortBy: [{ key: "", order: undefined }],
  };
};

const openSheet = (_e: any, { item }: any) => {
  openDialog(item.value);
};
const openDialog = (item: Farm) => {
  selectedFarm.value = item;
  dialog.value = true;
};

const headers: VDataTableHeader = [
  { title: "ID", key: "farmId" },
  { title: "Name", key: "name" },
  {
    title: "Total Public IPs",
    key: "totalPublicIp",
    align: "start",
    sortable: false,
  },
  {
    title: "Available Public IPs",
    key: "freePublicIp",
    align: "start",
    sortable: false,
  },
  {
    title: "Certification Type",
    key: "certificationType",
    align: "start",
    sortable: false,
  },
  {
    title: "Pricing Policy",
    key: "pricingPolicyId",
    align: "start",
    sortable: false,
  },
];
</script>

<script lang="ts">
import type { FarmsQuery } from "@threefold/gridproxy_client";

import Filters from "@/components/filter.vue";
import FarmDetailsCard from "@/components/node_details_cards/farm_details_card.vue";
import TwinDetailsCard from "@/components/node_details_cards/twin_details_card.vue";
import { createCustomToast, ToastType } from "@/utils/custom_toast";
export default {
  name: "Farms",
  components: {
    Filters,
    FarmDetailsCard,
    TwinDetailsCard,
  },
};
</script>
