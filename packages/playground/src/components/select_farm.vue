<template>
  <section>
    <h6 class="text-h5 mb-4 mt-2">Choose a Location</h6>
    <SelectCountry v-model="country" />

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
          :model-value="shouldBeUpdated ? undefined : farm"
          @update:model-value="farm = $event"
          :error-messages="!loading && !farms.length ? 'No farms where found with the specified resources.' : undefined"
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
                <!-- @click="loadNextPage" -->
                <!-- :loading="loading" -->
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
import { onMounted, onUnmounted, type PropType, ref, watch } from "vue";

import { useInputRef } from "@/hooks/input_validator";

import { useProfileManager } from "../stores/profile_manager";
import type { Farm } from "../types";
import { getFarms } from "../utils/get_farms";
import { getGrid } from "../utils/grid";
import { useFarmGatewayManager } from "./farm_gateway_manager.vue";
import { useFarm } from "./select_farm_manager.vue";

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
  modelValue: { type: Object as PropType<Farm> },
  country: String,
  filters: { default: () => ({} as Filters), type: Object as PropType<Filters> },
  exclusiveFor: String,
  loading: Boolean,
});
const emits = defineEmits<{
  (event: "update:modelValue", value?: Farm): void;
  (event: "update:loading", value: boolean): void;
}>();

const SIZE = 20;
const page = ref(1);

const farmInput = useInputRef();
const profileManager = useProfileManager();
const country = ref<string>();

const farm = ref<Farm>();
const farmManager = useFarm();
watch([farm, country], ([f, c]) => {
  farmManager?.setFarmId(f?.farmID);
  emits("update:modelValue", f ? { farmID: f.farmID, name: f.name, country: c ?? undefined } : undefined);
});
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
      farm.country = country.value;
      FarmGatewayManager?.register(farm);
      FarmGatewayManager?.setLoading(false);
    }
  },
  { immediate: true },
);

const farms = ref<Farm[]>([]);
let initialized = false;
async function loadFarms() {
  farmInput.value?.setStatus(ValidatorStatus.Pending);

  loading.value = true;
  const oldFarm = farm.value;

  const grid = await getGrid(profileManager.profile!);
  const filters = props.filters;
  const _farms = await getFarms(
    grid!,
    {
      size: SIZE,
      page: page.value,
      country: country.value,
      nodeMRU: filters.memory ? Math.round(filters.memory / 1024) : undefined,
      nodeHRU: filters.disk,
      nodeSRU: filters.ssd,
      publicIp: filters.publicIp,
      availableFor: grid!.twinId,
      nodeCertified: filters.certified,
      nodeRentedBy: filters.rentedBy ? filters.rentedBy : undefined,
      nodeHasGPU: filters.hasGPU ? filters.hasGPU : undefined,
    },
    { exclusiveFor: props.exclusiveFor },
  );

  if (page.value === 1) {
    farms.value = _farms;
  } else {
    farms.value = farms.value.concat(_farms);
  }

  if (oldFarm) {
    farm.value = undefined;
    await nextTick();
    farm.value = farms.value.find(f => f.name === oldFarm.name);
  }

  if (!farm.value) {
    farm.value = farms.value[0];
  }

  if (!farm.value) {
    farmInput.value.setStatus(initialized ? ValidatorStatus.Invalid : ValidatorStatus.Init);
    if (!initialized) {
      initialized = true;
    }
  }

  page.value = _farms.length < SIZE ? -1 : page.value + 1;
  loading.value = false;
}
onMounted(loadFarms);
onUnmounted(() => FarmGatewayManager?.unregister());

const shouldBeUpdated = ref(false);
watch(
  () => ({ ...props.filters, country: country.value }),
  (value, oldValue) => {
    if (
      value.cpu === oldValue.cpu &&
      value.memory === oldValue.memory &&
      value.ssd === oldValue.ssd &&
      value.disk === oldValue.disk &&
      value.publicIp === oldValue.publicIp &&
      value.country === oldValue.country &&
      value.certified === oldValue.certified &&
      value.rentedBy === oldValue.rentedBy &&
      value.hasGPU === oldValue.hasGPU
    )
      return;

    shouldBeUpdated.value = true;
  },
);

watch([loading, shouldBeUpdated], async ([l, s]) => {
  if (l || !s) return;
  shouldBeUpdated.value = false;
  clearTimeout(delay.value);
  delay.value = setTimeout(async () => {
    page.value = 1;
    await loadFarms();
  }, 2000);
});
</script>

<script lang="ts">
import { nextTick } from "vue";

import { ValidatorStatus } from "@/hooks/form_validator";

import SelectCountry from "./select_country.vue";

export default {
  name: "SelectFarm",
  components: {
    SelectCountry,
  },
};
</script>
