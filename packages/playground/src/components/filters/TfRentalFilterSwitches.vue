<template>
  <div class="flex flex-col gap-4">
    <input-tooltip
      v-if="showGPU"
      inline
      tooltip="
    Selecting a Node with GPU.
    When selecting a node with GPU resources, please make sure that you have a rented node. To rent a node and gain access to GPU capabilities, you can use our dashboard.
  "
    >
      <v-switch
        color="primary"
        inset
        label="GPU"
        :model-value="hasGPUModel"
        @update:model-value="hasGPUModel = $event"
        hide-details
      />
    </input-tooltip>

    <v-switch
      color="primary"
      inset
      label="Rented By Me"
      :model-value="rentedByMeModel"
      @update:model-value="rentedByMeModel = $event"
      hide-details
    />

    <input-tooltip inline tooltip="Click to know more about dedicated machines." :href="manual?.dedicated_machines">
      <v-switch
        color="primary"
        inset
        label="Rentable"
        :model-value="dedicatedModel"
        @update:model-value="dedicatedModel = $event"
        hide-details
      />
    </input-tooltip>

    <input-tooltip inline tooltip="Renting capacity on certified nodes is charged 25% extra.">
      <v-switch
        color="primary"
        inset
        label="Certified"
        :model-value="certifiedModel"
        @update:model-value="certifiedModel = $event"
        hide-details
      />
    </input-tooltip>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

import { manual } from "@/utils/manual";

const props = defineProps({
  rentedByMe: { type: Boolean, default: false },
  dedicated: { type: Boolean, default: false },
  certified: { type: Boolean, default: false },
  hasGPU: { type: Boolean, default: false },
  showGPU: { type: Boolean, default: false },
});

const emit = defineEmits(["update:rentedByMe", "update:dedicated", "update:certified", "update:hasGPU"]);

const rentedByMeModel = computed({
  get: () => !!props.rentedByMe,
  set: (val: boolean) => emit("update:rentedByMe", val),
});

const dedicatedModel = computed({
  get: () => !!props.dedicated,
  set: (val: boolean) => emit("update:dedicated", val),
});

const certifiedModel = computed({
  get: () => !!props.certified,
  set: (val: boolean) => emit("update:certified", val),
});

const hasGPUModel = computed({
  get: () => !!props.hasGPU,
  set: (val: boolean) => emit("update:hasGPU", val),
});
</script>

<script lang="ts">
export default {
  name: "RentalFilterSwitches",
};
</script>
