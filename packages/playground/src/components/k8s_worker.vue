<template>
  <input-validator
    :value="$props.modelValue.name"
    :rules="[
      validators.required('Name is required.'),
      validators.isLowercase('Name should consist of lowercase letters only.'),
      name => validators.isAlpha('Name must start with alphabet char.')(name[0]),
      validators.isAlphanumeric('Name should consist of alphabets & numbers only.'),
      validators.minLength('Name minimum length is 2 chars.', 2),
      validators.maxLength('Name max length is 15 chars.', 15),
    ]"
    #="{ props }"
  >
    <input-tooltip #="{ tooltipProps }" tooltip="Solution name.">
      <v-text-field label="Name" v-model="$props.modelValue.name" v-bind="{ ...props, ...tooltipProps }" />
    </input-tooltip>
  </input-validator>

  <input-validator
    :value="$props.modelValue.cpu"
    :rules="[
      validators.required('CPU is required.'),
      validators.isInt('CPU must be a valid integer.'),
      validators.min('CPU min is 1 cores.', 1),
      validators.max('CPU max is 32 cores.', 32),
    ]"
    #="{ props }"
  >
    <input-tooltip #="{ tooltipProps }" tooltip="The number of virtual cores allocated to your instance.">
      <v-text-field
        label="CPU (vCores)"
        type="number"
        v-model.number="$props.modelValue.cpu"
        v-bind="{ ...props, ...tooltipProps }"
      />
    </input-tooltip>
  </input-validator>

  <input-validator
    :value="$props.modelValue.memory"
    :rules="[
      validators.required('Memory is required.'),
      validators.isInt('Memory must be a valid integer.'),
      validators.min('Minimum allowed memory is 1024 MB.', 1024),
      validators.max('Maximum allowed memory is 256 GB.', 256 * 1024),
    ]"
    #="{ props }"
  >
    <input-tooltip #="{ tooltipProps }" tooltip="The amount of RAM (Random Access Memory) allocated to your instance.">
      <v-text-field
        label="Memory (MB)"
        type="number"
        v-model.number="$props.modelValue.memory"
        v-bind="{ ...props, ...tooltipProps }"
      />
    </input-tooltip>
  </input-validator>

  <input-validator
    :value="$props.modelValue.diskSize"
    :rules="[
      validators.required('Disk size is required.'),
      validators.isInt('Disk size must be a valid integer.'),
      validators.min('Minimum allowed disk size is 1 GB.', 1),
      validators.max('Maximum allowed disk size is 10000 GB.', 10000),
    ]"
    #="{ props }"
  >
    <input-tooltip #="{ tooltipProps }" tooltip="Disk Size.">
      <v-text-field
        label="Size (GB)"
        type="number"
        v-model.number="$props.modelValue.diskSize"
        v-bind="{ ...props, ...tooltipProps }"
      />
    </input-tooltip>
  </input-validator>

  <Network
    v-model:ipv4="$props.modelValue.ipv4"
    v-model:ipv6="$props.modelValue.ipv6"
    v-model:planetary="$props.modelValue.planetary"
  />
  <RootFsSize
    :cpu="$props.modelValue.cpu"
    :memory="$props.modelValue.memory"
    v-model.number="$props.modelValue.rootFsSize"
  />

  <SelectFarm
    :filters="{
      cpu: $props.modelValue.cpu,
      memory: $props.modelValue.memory,
      publicIp: $props.modelValue.ipv4,
      ssd: $props.modelValue.diskSize + $props.modelValue.rootFsSize,
    }"
    v-model="$props.modelValue.farm"
  />
</template>

<script lang="ts" setup>
defineProps<{ modelValue: K8SWorker }>();
</script>

<script lang="ts">
import { generateString } from "@threefold/grid_client";

import type { Farm, K8SWorker } from "../types";
import Network from "./networks.vue";
import RootFsSize from "./root_fs_size.vue";
import SelectFarm from "./select_farm.vue";

export function createWorker(name: string = "wr" + generateString(9)): K8SWorker {
  return {
    name,
    cpu: 1,
    memory: 4096,
    diskSize: 100,
    ipv4: false,
    ipv6: false,
    planetary: true,
    rootFsSize: 2,
    farm: undefined as Farm | undefined,
  };
}

export default {
  name: "K8SWorker",
  components: {
    SelectFarm,
    RootFsSize,
  },
};
</script>
