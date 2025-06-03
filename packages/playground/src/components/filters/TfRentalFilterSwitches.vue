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
        hide-details
        @update:model-value="onUpdateHasGPU"
      />
    </input-tooltip>

    <v-switch
      color="primary"
      inset
      label="Rented By Me"
      :model-value="rentedByMeModel"
      hide-details
      @update:model-value="onUpdateRentedByMe"
    />

    <input-tooltip
      inline
      tooltip="Click to know more about dedicated machines."
      :href="manual?.dedicated_machines"
    >
      <v-switch
        color="primary"
        inset
        label="Rentable"
        :model-value="dedicatedModel"
        hide-details
        @update:model-value="onUpdateDedicated"
      />
    </input-tooltip>

    <input-tooltip
      inline
      tooltip="Renting capacity on certified nodes is charged 25% extra."
    >
      <v-switch
        color="primary"
        inset
        label="Certified"
        :model-value="certifiedModel"
        hide-details
        @update:model-value="onUpdateCertified"
      />
    </input-tooltip>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

import { manual } from "@/utils/manual";
import { solutionType } from "@/types";

import { useRoute } from "vue-router";

const props = defineProps({
  rentedByMe: Boolean,
  dedicated: Boolean,
  certified: Boolean,
  hasGPU: Boolean,
});
const emit = defineEmits(["update:rentedByMe", "update:dedicated", "update:certified", "update:hasGPU"]);

const route = useRoute();

const rentedByMeModel = computed({
  get: () => !!props.rentedByMe,
  set: val => emit("update:rentedByMe", val),
});

const dedicatedModel = computed({
  get: () => !!props.dedicated,
  set: val => emit("update:dedicated", val),
});

const certifiedModel = computed({
  get: () => !!props.certified,
  set: val => emit("update:certified", val),
});

const hasGPUModel = computed({
  get: () => !!props.hasGPU,
  set: val => emit("update:hasGPU", val),
});

const showGPU = computed(() => route.meta.title == solutionType.fullvm || route.meta.title == solutionType.openwebui);

function onUpdateRentedByMe(val: boolean | null) {
  rentedByMeModel.value = !!val;
}

function onUpdateDedicated(val: boolean | null) {
  dedicatedModel.value = !!val;
}

function onUpdateCertified(val: boolean | null) {
  certifiedModel.value = !!val;
}

function onUpdateHasGPU(val: boolean | null) {
  hasGPUModel.value = !!val;
}
</script>

<script lang="ts">
export default {
  name: "RentalFilterSwitches",
};
</script>
