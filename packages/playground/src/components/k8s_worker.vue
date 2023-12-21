<template>
  <div>
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
      <input-tooltip tooltip="Node name.">
        <v-text-field label="Name" v-model="$props.modelValue.name" v-bind="props" />
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
      <input-tooltip tooltip="The number of virtual cores allocated to your instance.">
        <v-text-field label="CPU (vCores)" type="number" v-model.number="$props.modelValue.cpu" v-bind="props" />
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
      <input-tooltip tooltip="The amount of RAM (Random Access Memory) allocated to your instance.">
        <v-text-field label="Memory (MB)" type="number" v-model.number="$props.modelValue.memory" v-bind="props" />
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
      <input-tooltip tooltip="Disk Size.">
        <v-text-field label="Size (GB)" type="number" v-model.number="$props.modelValue.diskSize" v-bind="props" />
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

    <input-tooltip
      inline
      tooltip="Click to know more about dedicated nodes."
      href="https://manual.grid.tf/dashboard/portal/dashboard_portal_dedicated_nodes.html"
    >
      <v-switch color="primary" inset label="Dedicated" v-model="$props.modelValue.dedicated" />
    </input-tooltip>

    <input-tooltip inline tooltip="Renting capacity on certified nodes is charged 25% extra.">
      <v-switch color="primary" inset label="Certified" v-model="$props.modelValue.certified" />
    </input-tooltip>

    <TfSelectionDetails
      :filters-validators="{
        memory: { min: 1024 },
        rootFilesystemSize: { min: rootFs($props.modelValue.cpu ?? 0, $props.modelValue.memory ?? 0) },
      }"
      :filters="{
        ipv4: $props.modelValue.ipv4,
        certified: $props.modelValue.certified,
        dedicated: $props.modelValue.dedicated,
        cpu: $props.modelValue.cpu,
        ssdDisks: [$props.modelValue.diskSize],
        memory: $props.modelValue.memory,
        rootFilesystemSize: $props.modelValue.rootFsSize,
      }"
      v-model="$props.modelValue.selectionDetails"
    />
  </div>
</template>

<script lang="ts">
import type { PropType } from "vue";

import type { K8SWorker } from "../types";
import rootFs from "../utils/root_fs";
import { generateName } from "../utils/strings";
import RootFsSize from "./root_fs_size.vue";

export function createWorker(name: string = generateName({ prefix: "wr" })): K8SWorker {
  return {
    name,
    cpu: 1,
    memory: 4096,
    diskSize: 100,
    ipv4: false,
    ipv6: false,
    planetary: true,
    rootFsSize: 2,
    dedicated: false,
    certified: false,
    rentedBy: undefined,
  };
}

export default {
  name: "K8SWorker",
  components: { RootFsSize },
  props: {
    modelValue: {
      type: Object as PropType<K8SWorker>,
      required: true,
    },
  },
  setup() {
    return { rootFs };
  },
};
</script>
