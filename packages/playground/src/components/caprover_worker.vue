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
      :minimum="{ cpu: 1, memory: 1024, disk: 50 }"
      :standard="{ cpu: 2, memory: 1024 * 2, disk: 100 }"
      :disabled="loadingFarm"
    />

    <input-tooltip
      inline
      tooltip="Click to know more about dedicated nodes."
      href="https://manual.grid.tf/dashboard/portal/dashboard_portal_dedicated_nodes.html"
    >
      <v-switch color="primary" inset label="Dedicated" v-model="$props.modelValue.dedicated" :disabled="loadingFarm" />
    </input-tooltip>
    <input-tooltip inline tooltip="Renting capacity on certified nodes is charged 25% extra.">
      <v-switch color="primary" inset label="Certified" v-model="$props.modelValue.certified" :disabled="loadingFarm" />
    </input-tooltip>

    <SelectFarmManager>
      <SelectFarm
        :filters="{
          cpu: $props.modelValue.solution?.cpu,
          memory: $props.modelValue.solution?.memory,
          publicIp: true,
          ssd: ($props.modelValue.solution?.disk ?? 0) + rootFilesystemSize,
          rentedBy: $props.modelValue.dedicated ? profileManager.profile?.twinId : undefined,
          certified: $props.modelValue.certified,
        }"
        v-model="$props.modelValue.farm"
        v-model:loading="loadingFarm"
      />

      <SelectNode
        v-model="$props.modelValue.selectedNode"
        :filters="{
          farmId: $props.modelValue.farm?.farmID,
          cpu: $props.modelValue.solution?.cpu ?? 0,
          memory: $props.modelValue.solution?.memory ?? 0,
          diskSizes: [$props.modelValue.solution?.disk ?? 0],
          rentedBy: $props.modelValue.dedicated ? profileManager.profile?.twinId : undefined,
          certified: $props.modelValue.certified,
        }"
        :root-file-system-size="rootFilesystemSize"
      />
    </SelectFarmManager>
  </div>
</template>

<script lang="ts" setup>
import { useProfileManager } from "../stores";
import rootFs from "../utils/root_fs";

const emits = defineEmits<{ (event: "update:loading", value: boolean): void }>();
const props = defineProps<{ modelValue: CaproverWorker }>();
const rootFilesystemSize = computed(() =>
  rootFs(props.modelValue.solution?.cpu ?? 0, props.modelValue.solution?.memory ?? 0),
);
const profileManager = useProfileManager();
const farmManager = useFarm();
const loadingFarm = ref(farmManager?.getLoading());

watch(loadingFarm, (loadingFarm): void => {
  emits("update:loading", loadingFarm!);
});
</script>

<script lang="ts">
import { computed, ref, watch } from "vue";

import SelectFarmManager, { useFarm } from "../components/select_farm_manager.vue";
import SelectNode from "../components/select_node.vue";
import type { CaproverWorker } from "../types";
import { generateName } from "../utils/strings";
import SelectFarm from "./select_farm.vue";
import SelectSolutionFlavor from "./select_solution_flavor.vue";

export function createWorker(name: string = generateName(9, { prefix: "wr" })): CaproverWorker {
  return { name };
}

export default {
  name: "CaproverWorker",
  components: {
    SelectSolutionFlavor,
    SelectFarm,
    SelectNode,
    SelectFarmManager,
  },
};
</script>
