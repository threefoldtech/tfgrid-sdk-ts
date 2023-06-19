<template>
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
    <input-tooltip tooltip="Worker name.">
      <v-text-field label="Name" v-model="$props.modelValue.name" v-bind="props" />
    </input-tooltip>
  </input-validator>

  <SelectSolutionFlavor
    v-model="$props.modelValue.solution"
    :minimum="{ cpu: 1, memory: 1024, disk: 50 }"
    :standard="{ cpu: 2, memory: 1024 * 2, disk: 100 }"
  />

  <SelectFarm
    :filters="{
      cpu: $props.modelValue.solution?.cpu,
      memory: $props.modelValue.solution?.memory,
      publicIp: true,
      ssd:
        ($props.modelValue.solution?.disk ?? 0) +
        rootFs($props.modelValue.solution?.cpu ?? 0, $props.modelValue.solution?.memory ?? 0),
    }"
    v-model="$props.modelValue.farm"
  />
</template>

<script lang="ts" setup>
import rootFs from "../utils/root_fs";

defineProps<{ modelValue: CaproverWorker }>();
</script>

<script lang="ts">
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
  },
};
</script>
