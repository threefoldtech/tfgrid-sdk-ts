<template>
  <view-layout>
    <v-row>
      <v-col>
        <node-filters v-model="filterInputs" v-model:valid="isValidForm" @update:model-value="inputFiltersReset" />
        <FarmsTable :items="farms" :loading="loading" v-model:selectedFarm="selectedFarm" @open-dialog="openDialog" />
      </v-col>
    </v-row>
    <farmDialog v-if="selectedFarm" :openDialog="isDialogOpened" :farm="selectedFarm" @close-dialog="closeDialog" />
  </view-layout>
</template>

<script lang="ts" setup>
import type { CertificationType, FarmsQuery, PublicIp } from "@threefold/gridproxy_client";
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

import router from "@/router";
import { inputsInitializer } from "@/utils/filter_farms";

import { getFarmQueries, getFarms } from "./utils/helpers";
import {
  type FarmFilterInputs,
  type FarmFilterOptions,
  type FarmMixedFilter,
  farmOptionsInitializer,
} from "./utils/types";

export interface IFarm {
  farmId: number;
  name: string;
  twinId: number;
  pricingPolicyId: number;
  certificationType: CertificationType;
  publicIps: PublicIp[];
  stellarAddress?: string;
  totalPublicIp: number;
  usedPublicIp: number;
  freePublicIp: number;
}
const route = useRoute();

const loading = ref<boolean>(false);
const farms = ref<IFarm[]>([]);
const isDialogOpened = ref<boolean>(false);
const selectedFarm = ref<IFarm>();
const filterInputs = ref<FarmFilterInputs>(inputsInitializer);
const filterOptions = ref<FarmFilterOptions>(farmOptionsInitializer);
const isValidForm = ref<boolean>(false);
const farmsCount = ref<number>(0);
const mixedFilters = ref<FarmMixedFilter>({
  inputs: filterInputs.value,
  options: filterOptions.value,
});

const _getFarms = async (queries: Partial<FarmsQuery>) => {
  loading.value = true;
  try {
    const { count, data } = await getFarms(queries);
    if (count) {
      farmsCount.value = count;
    }
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
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

const checkPath = async () => {
  if (route.query.twinId) {
    router.replace(route.path);
  }
};

const openDialog = (item: IFarm) => {
  selectedFarm.value = item;
  isDialogOpened.value = true;
};

const closeDialog = () => {
  if (route.query.twinId) {
    router.replace(route.path);
  }
  isDialogOpened.value = false;
};

watch(
  mixedFilters,
  async () => {
    const queries = getFarmQueries(mixedFilters.value);
    await _getFarms(queries);
  },
  { deep: true },
);

const inputFiltersReset = (nFltrNptsVal: FarmFilterInputs) => {
  mixedFilters.value.inputs = nFltrNptsVal;
  mixedFilters.value.options.page = 1;
  mixedFilters.value.options.size = 10;
  mixedFilters.value.options.retCount = true;
};

onMounted(async () => {
  await checkPath();
  const queries = getFarmQueries(mixedFilters.value);
  await _getFarms(queries);
});
</script>

<script lang="ts">
import farmDialog from "./components/farm_Dialog.vue";
import FarmsTable from "./components/farms_table.vue";

export default {
  name: "Farms",
  components: {
    FarmsTable,
    farmDialog,
  },
};
</script>
