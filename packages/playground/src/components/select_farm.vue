<template>
  <section>
    <h6 class="text-h5 mb-4">Choose a Location</h6>
    <SelectCountry v-model="country" />

    <input-validator :rules="[validators.required('Farm is required.')]" :value="farm?.farmID" ref="farmInput">
      <input-tooltip tooltip="The name of the farm that you want to deploy inside it.">
        <v-autocomplete
          :disabled="loading"
          label="Farm Name"
          v-bind="props"
          :items="farms"
          :loading="loading"
          item-title="name"
          return-object
          :model-value="shouldBeUpdated ? undefined : farm"
          @update:model-value="farm = $event"
          :error-messages="!loading && !farms.length ? 'No farms where found with the specified resources.' : undefined"
        />
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
import { useFarmGatewayManager } from "./farm_gateway_mamager.vue";

export interface Filters {
  publicIp?: boolean;
  cpu?: number;
  memory?: number;
  ssd?: number;
  disk?: number;
}
const FarmGatewayManager = useFarmGatewayManager();
const props = defineProps({
  modelValue: { type: Object as PropType<Farm> },
  country: String,
  filters: { default: () => ({} as Filters), type: Object as PropType<Filters> },
  exclusiveFor: String,
});
const emits = defineEmits<{ (event: "update:modelValue", value?: Farm): void }>();

const farmInput = useInputRef();
const profileManager = useProfileManager();
const country = ref<string>();

const farm = ref<Farm>();
watch([farm, country], ([f, c]) => {
  emits("update:modelValue", f ? { farmID: f.farmID, name: f.name, country: c ?? undefined } : undefined);
});
watch(farm, (f, c) => {
  if (f) FarmGatewayManager?.register(f);
});

const loading = ref(false);
const farms = ref<Farm[]>([]);
let initialized = false;
async function loadFarms() {
  farmInput.value?.setStatus(ValidatorStatus.Pending);

  loading.value = true;
  const oldFarm = farm.value;

  const grid = await getGrid(profileManager.profile!);
  const filters = props.filters;
  farms.value = await getFarms(
    grid!,
    {
      country: country.value,
      cru: filters.cpu,
      mru: filters.memory ? Math.round(filters.memory / 1024) : undefined,
      hru: filters.disk,
      sru: filters.ssd,
      publicIPs: filters.publicIp,
      availableFor: grid!.twinId,
    },
    { exclusiveFor: props.exclusiveFor },
  );

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
      value.country === oldValue.country
    )
      return;

    shouldBeUpdated.value = true;
  },
);

watch([loading, shouldBeUpdated], async ([l, s]) => {
  if (l || !s) return;
  shouldBeUpdated.value = false;
  await loadFarms();
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
