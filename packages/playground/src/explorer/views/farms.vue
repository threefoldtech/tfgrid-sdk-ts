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
    <farmDialog
      v-if="selectedFarm"
      :openDialog="isDialogOpened"
      :farm="selectedFarm"
      @update:model-value="closeDialog"
      @close-dialog="closeDialog"
    />
  </view-layout>
</template>

<script lang="ts" setup>
import type { Farm } from "@threefold/gridproxy_client";
import debounce from "lodash/debounce.js";
import { onMounted, ref, watch } from "vue";

import type { VDataTableHeader } from "../../types";
import type { FilterFarmInputs } from "../../utils/filter_farms";
import { inputsInitializer } from "../../utils/filter_farms";
import { getFarmQueries, getFarms } from "../utils/helpers";
import type { FarmFilterOptions, MixedFarmFilter } from "../utils/types";
const loading = ref<boolean>(false);
const farms = ref<Farm[]>();
const isDialogOpened = ref<boolean>(false);
const selectedFarm = ref<Farm>();
const filterFarmInputs = ref<FilterFarmInputs>(inputsInitializer);
const size = ref(10);
const page = ref(1);

const sortBy = ref([{ key: "", order: undefined }]);
const filterOptions = ref<FarmFilterOptions>({
  size: size.value,
  page: page.value,
  sortBy: sortBy.value,
});
const mixedFarmFilters = ref<MixedFarmFilter>({ inputs: filterFarmInputs.value, options: filterOptions.value });
const isFormLoading = ref<boolean>(true);
const isValidForm = ref<boolean>(false);
const totalFarms = ref(0);

const _getFarms = async (queries: Partial<FarmsQuery>) => {
  loading.value = true;
  isFormLoading.value = true;
  try {
    const { count, data } = await getFarms(queries);

    if (data) {
      totalFarms.value = count || 0;
      farms.value = data.map(farm => {
        const ips = farm.publicIps;
        const total = ips.length;
        const used = ips.filter(x => x.contract_id === 0).length;
        return {
          ...farm,
          totalPublicIp: total,
          usedPublicIp: used,
          freePublicIp: total - used,
        };
      });
      if (sortBy.value[0]) {
        await updateQueries();
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
};
onMounted(async () => {
  await updateFarms();
});

const request = debounce(_getFarms, 1000);
const updateFarms = async () => {
  await updateQueries();
  const queries = getFarmQueries(mixedFarmFilters.value);

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
  const options = mixedFarmFilters.value.options;
  if (options) {
    options.page = page.value;
    options.size = size.value;
    options.sortBy = sortBy.value;
  }
};
watch(mixedFarmFilters.value, updateFarms, { deep: true });

const inputFiltersReset = (nFltrNptsVal: FilterFarmInputs) => {
  mixedFarmFilters.value.inputs = nFltrNptsVal;
  nFltrNptsVal.farmId.value = undefined;
  nFltrNptsVal.name.value = undefined;
  nFltrNptsVal.totalIps.value = undefined;
  nFltrNptsVal.pricingPolicyId.value = undefined;
};
const openSheet = (_e: any, { item }: any) => {
  openDialog(item.value);
};
const openDialog = (item: Farm) => {
  selectedFarm.value = item;
  isDialogOpened.value = true;
};

const closeDialog = () => {
  isDialogOpened.value = false;
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
    title: "Free Public IPs",
    key: "freePublicIp",
    align: "start",
    sortable: false,
  },
  {
    title: "Used Public IPs",
    key: "usedPublicIp",
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

import Filters from "../../components/filter.vue";
import { createCustomToast, ToastType } from "../../utils/custom_toast";
import FarmDialog from "../components/farm_dialog.vue";

export default {
  name: "Farms",
  components: {
    FarmDialog,
    Filters,
  },
};
</script>
