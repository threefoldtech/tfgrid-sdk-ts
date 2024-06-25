<template>
  <div>
    <input-validator
      :rules="[
        validators.required('Name is required.'),
        validators.isLowercase('Name should consist of lowercase letters only.'),
        validators.isAlphanumeric('Name should consist of letters and numbers only.'),
        name => validators.isAlpha('Name must start with alphabet char.')(name[0]),
        validators.minLength('Name must be at least 2 characters.', 2),
        validators.maxLength('Name cannot exceed 15 characters.', 15),
      ]"
      :value="$props.modelValue.name"
      #="{ props }"
    >
      <input-tooltip tooltip="Node name.">
        <v-text-field label="Name" v-model="$props.modelValue.name" v-bind="props" />
      </input-tooltip>
    </input-validator>

    <SelectSolutionFlavor
      v-model="$props.modelValue.solution"
      :small="{ cpu: 1, memory: 2, disk: 50 }"
      :medium="{ cpu: 2, memory: 4, disk: 100 }"
    />
    <Networks v-model:mycelium="$props.modelValue.mycelium" />

    <input-tooltip inline tooltip="Click to know more about dedicated machines." :href="manual.dedicated_machines">
      <v-switch color="primary" inset label="Dedicated" v-model="$props.modelValue.dedicated" />
    </input-tooltip>
    <input-tooltip inline tooltip="Renting capacity on certified nodes is charged 25% extra.">
      <v-switch color="primary" inset label="Certified" v-model="$props.modelValue.certified" />
    </input-tooltip>

    <TfSelectionDetails
      :filters="{
        ipv4: true,
        certified: $props.modelValue.certified,
        dedicated: $props.modelValue.dedicated,
        cpu: $props.modelValue.solution?.cpu,
        solutionDisk: $props.modelValue.solution?.disk,
        memory: $props.modelValue.solution?.memory,
        rootFilesystemSize,
      }"
      v-model="$props.modelValue.selectionDetails"
    />
  </div>
</template>

<script lang="ts">
import { calculateRootFileSystem } from "@threefold/grid_client";
import { computed, type PropType } from "vue";

import { manual } from "@/utils/manual";

import Networks from "../components/networks.vue";
import type { CaproverWorker } from "../types";
import { generateName } from "../utils/strings";
import SelectSolutionFlavor from "./select_solution_flavor.vue";

export function createWorker(name: string = generateName({ prefix: "wr" })): CaproverWorker {
  return { name, mycelium: true };
}

export default {
  name: "CaproverWorker",
  components: { SelectSolutionFlavor, Networks },
  props: { modelValue: { type: Object as PropType<CaproverWorker>, required: true } },
  setup(props) {
    const rootFilesystemSize = computed(() => {
      const { cpu = 0, memory = 0 } = props.modelValue.solution || {};
      return calculateRootFileSystem({
        CPUCores: cpu,
        RAMInMegaBytes: memory,
      });
    });

    return { rootFilesystemSize, manual };
  },
};
</script>
