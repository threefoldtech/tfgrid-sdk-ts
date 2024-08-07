<template>
  <div>
    <input-tooltip
      tooltip="Choosing the appropriate computing resources and performance capabilities for a virtual instance or server. When provisioning a virtual machine or cloud instance, the 'Select instance capacity' step allows users to specify the desired CPU, memory, storage, and network resources for their virtual environment."
    >
      <v-select
        label="Select instance capacity"
        v-bind="props"
        :items="packages"
        v-model="solution"
        :disabled="props.disabled"
      />
    </input-tooltip>

    <div v-if="solution === 'custom'">
      <input-validator
        :value="cpu"
        :rules="[
          validators.required('CPU is required.'),
          validators.isInt('CPU must be a valid integer.'),
          validators.min('CPU min is 1 cores.', 1),
          validators.max('CPU max is 32 cores.', 32),
        ]"
        #="{ props }"
      >
        <input-tooltip tooltip="The number of virtual cores allocated to your instance.">
          <v-text-field label="CPU (vCores)" type="number" v-model.number="cpu" v-bind="props" />
        </input-tooltip>
      </input-validator>

      <input-validator
        :value="memory"
        :rules="[
          validators.required('Memory is required.'),
          validators.isInt('Memory must be a valid integer.'),
          validators.min('Minimum allowed memory is 256 MB.', 256),
          validators.max('Maximum allowed memory is 256 GB.', 256 * 1024),
        ]"
        #="{ props }"
      >
        <input-tooltip tooltip="The amount of RAM (Random Access Memory) allocated to your instance.">
          <v-text-field label="Memory (MB)" type="number" v-model.number="memory" v-bind="props" />
        </input-tooltip>
      </input-validator>

      <input-validator
        :value="disk"
        :rules="[
          validators.required('SSD Storage size is required.'),
          validators.isInt('SSD Storage size must be a valid integer.'),
          validators.min(`Minimum allowed ssd storage size is ${minDiskSize} GB.`, minDiskSize),
          validators.max('Maximum allowed ssd storage size is 10000 GB.', 10000),
        ]"
        #="{ props }"
      >
        <input-tooltip
          tooltip="The storage capacity allocated to your instance, indicating the amount of space available to store files, data, and applications."
        >
          <v-text-field label="SSD Storage (GB)" type="number" v-model.number="disk" v-bind="props" />
        </input-tooltip>
      </input-validator>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { PropType } from "vue";
import { computed, ref, watch } from "vue";

import type { solutionFlavor } from "../types";

type Package = PropType<solutionFlavor>;

const props = defineProps({
  small: { type: Object as Package, default: () => ({ cpu: 1, memory: 2, disk: 15 }) },
  medium: { type: Object as Package, default: () => ({ cpu: 2, memory: 4, disk: 100 }) },
  large: {
    type: Object as Package,
    default: () => ({ cpu: 4, memory: 16, disk: 250 }),
  },
  disabled: { type: Boolean },
});
const emits = defineEmits<{ (event: "update:model-value", value?: solutionFlavor): void }>();

const minDiskSize = computed(() => Math.min(15, props.small.disk, props.medium.disk, props.large.disk));

const packages = computed(() => {
  const { small, medium, large } = props;
  return [
    {
      title: `Small(CPU: ${small.cpu} vCores, Memory: ${small.memory} GB, SSD: ${small.disk} GB)`,
      value: small,
    },
    {
      title: `Medium(CPU: ${medium.cpu} vCores, Memory: ${medium.memory} GB, SSD: ${medium.disk} GB)`,
      value: medium,
    },
    {
      title: `Large(CPU: ${large.cpu} vCores, Memory: ${large.memory} GB, SSD: ${large.disk} GB)`,
      value: large,
    },
    { title: "Custom", value: "custom" },
  ];
});

const solution = ref(packages.value[0].value);
const cpu = ref<number>();
const memory = ref<number>();
const disk = ref<number>();

watch(
  solution,
  value => {
    if (value === "custom" || typeof value === "string") return;
    cpu.value = value.cpu;
    memory.value = value.memory * 1024;
    disk.value = value.disk;
  },
  { immediate: true },
);

watch(
  [cpu, memory, disk],
  ([cpu, memory, disk]) => {
    const value = cpu && memory && disk ? { cpu, memory, disk } : undefined;
    emits("update:model-value", value);
  },
  { immediate: true },
);
</script>

<script lang="ts">
export default {
  name: "SelectSolutionFlavor",
};
</script>
