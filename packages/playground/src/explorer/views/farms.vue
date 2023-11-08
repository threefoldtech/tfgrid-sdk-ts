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
        <FarmsTable :items="farms" :loading="loading" :selectedFarm="selectedFarm" @open-dialog="openDialog" />
      </v-col>
    </v-row>
    <farmDialog v-if="selectedFarm" :openDialog="isDialogOpened" :farm="selectedFarm" @close-dialog="closeDialog" />
  </view-layout>
</template>

<script lang="ts" setup>
import type { Farm } from "@threefold/gridproxy_client";
import debounce from "lodash/debounce.js";
import { onMounted, ref, watch } from "vue";

import type { FilterFarmInputs } from "../../utils/filter_farms";
import { inputsInitializer } from "../../utils/filter_farms";
import { getFarmQueries, getFarms } from "../utils/helpers";
import type { FarmFilterOptions, MixedFarmFilter } from "../utils/types";
import { farmOptionsInitializer } from "../utils/types";

const loading = ref<boolean>(false);
const farms = ref<Farm[]>();
const isDialogOpened = ref<boolean>(false);
const selectedFarm = ref<Farm>();
const filterFarmInputs = ref<FilterFarmInputs>(inputsInitializer);
const filterOptions = ref<FarmFilterOptions>(farmOptionsInitializer);
const mixedFarmFilters = ref<MixedFarmFilter>({ inputs: filterFarmInputs.value, options: filterOptions.value });
const isFormLoading = ref<boolean>(true);
const isValidForm = ref<boolean>(false);

const _getFarms = async (queries: Partial<FarmsQuery>) => {
  loading.value = true;
  isFormLoading.value = true;

  const { count, data } = await getFarms(queries);
  if (data) {
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
  }
  isFormLoading.value = false;
  loading.value = false;
};
onMounted(async () => {
  await _getFarms({});
});

const request = debounce(_getFarms, 1000);
watch(
  mixedFarmFilters,
  async () => {
    const queries = getFarmQueries(mixedFarmFilters.value);
    if (isValidForm.value) {
      await request(queries);
    }
  },
  { deep: true },
);
const inputFiltersReset = (nFltrNptsVal: FilterFarmInputs) => {
  mixedFarmFilters.value.inputs = nFltrNptsVal;
  nFltrNptsVal.farmId;
  nFltrNptsVal.farmName;
};
const openDialog = (item: Farm) => {
  selectedFarm.value = item;
  isDialogOpened.value = true;
};

const closeDialog = () => {
  isDialogOpened.value = false;
};
</script>

<script lang="ts">
import type { FarmsQuery } from "@threefold/gridproxy_client";

import Filters from "../../components/filter.vue";
import FarmDialog from "../components/farm_dialog.vue";
import FarmsTable from "../components/farms_table.vue";

export default {
  name: "Farms",
  components: {
    FarmsTable,
    FarmDialog,
    Filters,
  },
};
</script>
