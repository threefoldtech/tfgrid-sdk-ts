<template>
  <section>
    <h6 class="text-h5 mb-4 mt-2">Choose a Location</h6>
    <select-location v-model="location" :disabled="loading || loadingNodes" />
    <input-validator :rules="[validators.required('Farm is required.')]" :value="farm?.farmID" ref="farmInput">
      <input-tooltip tooltip="The name of the farm that you want to deploy inside it.">
        <v-autocomplete
          :disabled="loading || loadingNodes"
          label="Farm Name"
          v-bind="props"
          :items="farms"
          :loading="loading"
          item-title="name"
          return-object
          :model-value="shouldBeUpdated || loading ? undefined : farm"
          @update:model-value="farm = $event"
          :error-messages="!loading && !farms.length ? 'No farms where found with the specified resources.' : undefined"
          v-model:search="search"
          @blur="!search ? resetSearch() : undefined"
          clearable
          @click:clear="resetSearch"
        >
          <template v-slot:append-item v-if="page !== -1">
            <div class="px-4 mt-4">
              <v-btn
                block
                color="secondary"
                variant="tonal"
                rounded="large"
                size="large"
                @click="loadFarms"
                :loading="loading"
              >
                Load More Farms
              </v-btn>
            </div>
          </template>
        </v-autocomplete>
      </input-tooltip>
    </input-validator>
  </section>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, onUnmounted, type PropType, type Ref, ref, watch } from "vue";

import { useInputRef } from "../hooks/input_validator";
import { useProfileManager } from "../stores/profile_manager";
import type { FarmInterface } from "../types";
import { getFarms, getFarmsPages } from "../utils/get_farms";
import { getGrid } from "../utils/grid";
import { useFarmGatewayManager } from "./farm_gateway_manager.vue";
import { useFarm } from "./select_farm_manager.vue";
import { createLocation, defaultCountry, defaultRegion } from "./select_location.vue";

export interface Filters {
  publicIp?: boolean;
  cpu?: number;
  memory?: number;
  ssd?: number;
  disk?: number;
  certified?: boolean;
  hasGPU?: boolean;
  rentedBy?: number;
}
const FarmGatewayManager = useFarmGatewayManager();
const props = defineProps({
  modelValue: { type: Object as PropType<FarmInterface> },
  country: String,
  filters: { default: () => ({} as Filters), type: Object as PropType<Filters> },
  exclusiveFor: String,
  loading: Boolean,
});
const emits = defineEmits<{
  (event: "update:modelValue", value?: FarmInterface): void;
  (event: "update:loading", value: boolean): void;
  (event: "update:search", value?: string): void;
}>();

const SIZE = 20;
const page = ref();
const farmInput = useInputRef();
const profileManager = useProfileManager();
const location = ref(createLocation());
const search = ref<string>();
const searchInput = ref<string>();
const farm = ref<FarmInterface>();
const farmManager = useFarm();
watch(
  [farm, location],
  ([f, c]) => {
    const farm = { farmID: f?.farmID || -1, name: f?.name || defaultFarm, country: c.country, region: c.region };
    farmManager.setFarmId(farm);
    emits("update:modelValue", farm);
  },
  { immediate: true },
);

watch(
  search,
  debounce(async (value, oldValue) => {
    if (value !== oldValue && value && value?.length > 2 && oldValue != undefined && oldValue !== "") {
      await resetPages();
    }
  }, 2000),
);

const loading = ref(false);
const loadingNodes = ref(farmManager?.getLoading());
const delay = ref();
watch(
  [farm, loading],
  ([farm, loading]) => {
    emits("update:loading", loading);
    if (loading) {
      FarmGatewayManager?.setLoading(true);
    }

    if (farm && !loading) {
      farm.country = location.value.country;
      FarmGatewayManager?.register(farm);
      FarmGatewayManager?.setLoading(false);
    }
  },
  { immediate: true },
);
const selectedPages = ref([]) as Ref<number[]>;

const farms = ref<FarmInterface[]>([]);
let initialized = false;
const shouldBeUpdated = ref(false);
const pagesCount = ref();

function prepareFilters(filters: Filters, twinId: number): FarmFilterOptions {
  return {
    size: SIZE,
    page: Math.max(1, isNaN(page.value) ? 0 : page.value),
    country: location.value.country === defaultCountry ? undefined : location.value.country,
    region: location.value.region === defaultRegion ? undefined : location.value.region,
    nodeMRU: filters.memory ? Math.round(filters.memory / 1024) : undefined,
    nodeHRU: filters.disk,
    nodeSRU: filters.ssd,
    publicIp: filters.publicIp,
    availableFor: twinId,
    nodeCertified: filters.certified,
    nodeRentedBy: filters.rentedBy ? filters.rentedBy : undefined,
    nodeHasGPU: filters.hasGPU ? filters.hasGPU : undefined,
  };
}

async function loadFarms() {
  farmInput.value?.setStatus(ValidatorStatus.Pending);
  loading.value = true;
  const oldFarm = farm.value;
  const grid = await getGrid(profileManager.profile!);
  let _farms: FarmInterface[] = [];
  if (searchInput.value && searchInput.value?.length > 0) {
    const { data } = await gridProxyClient.farms.list({ nameContains: searchInput.value });
    _farms = data.map((_farm: any) => {
      return {
        name: _farm.name,
        farmID: _farm.farmId,
        country: _farm.country,
      } as FarmInterface;
    });
  } else {
    _farms = await getFarms(grid!, prepareFilters(props.filters, grid!.twinId), {
      exclusiveFor: props.exclusiveFor,
    });
  }
  selectedPages.value.push(page.value);
  if (!_farms.length && selectedPages.value.length !== pagesCount.value) {
    page.value = setRandomPage();
    await loadFarms();
    return;
  }
  farms.value = [
    { name: defaultFarm, farmID: -1, country: location.value.country, region: location.value.region },
    ...farms.value.concat(_farms),
  ];

  if (oldFarm) {
    farm.value = undefined;
    await nextTick();
    farm.value = farms.value.find(f => f.name === oldFarm.name);
  }

  if (!farm.value) {
    farm.value = farms.value[0];
    farmInput.value?.setStatus(initialized ? ValidatorStatus.Invalid : ValidatorStatus.Init);
    if (!initialized) {
      initialized = true;
    }
  }

  page.value = selectedPages.value.length === pagesCount.value ? -1 : setRandomPage();
  loading.value = false;
}

function setRandomPage() {
  let randPage = Math.floor(Math.random() * pagesCount.value) + 1;
  while (selectedPages.value.includes(randPage)) randPage = Math.floor(Math.random() * pagesCount.value) + 1;
  return randPage;
}
async function resetPages() {
  farms.value = [];
  loading.value = true;
  farmInput.value?.setStatus(ValidatorStatus.Pending);
  selectedPages.value = [];
  searchInput.value = search.value;
  const grid = await getGrid(profileManager.profile!);
  if (!grid) {
    console.log("can't get the grid");
    pagesCount.value = 1;
  } else {
    pagesCount.value = await getFarmsPages(grid, prepareFilters(props.filters, grid.twinId), SIZE);
  }
  page.value = setRandomPage();
  await loadFarms();
}

onMounted(resetPages);
onUnmounted(() => FarmGatewayManager?.unregister());

watch(
  () => ({ ...props.filters, country: location.value.country, region: location.value.region }),
  async (value, oldValue) => {
    shouldBeUpdated.value = !equals(value, oldValue);
  },
);

watch([loading, shouldBeUpdated], async ([l, s]) => {
  if (l || !s) return;
  shouldBeUpdated.value = false;
  clearTimeout(delay.value);
  delay.value = setTimeout(async () => {
    await resetPages();
  }, 2000);
});

async function resetSearch() {
  search.value = "";
  await resetPages();
  search.value = farm.value?.name;
  emits("update:search", search.value ?? undefined);
}
</script>

<script lang="ts">
import type { FarmFilterOptions } from "@threefold/grid_client";
import { debounce } from "lodash";
import equals from "lodash/fp/equals.js";

import { gridProxyClient } from "@/clients";
import { ValidatorStatus } from "@/hooks/form_validator";

import SelectLocation from "./select_location.vue";

export const defaultFarm = "All Farms";

export default {
  name: "SelectFarm",
  components: {
    SelectLocation,
  },
};
</script>
