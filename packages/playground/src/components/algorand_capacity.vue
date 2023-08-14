<template>
  <div>
    <input-tooltip inline #="{ props }" tooltip="Enable this option to set custom resources.">
      <v-switch
        color="primary"
        inset
        label="Set Custom Capacity"
        v-model="custom"
        v-bind="props"
        :disabled="disabled"
      />
    </input-tooltip>

    <slot></slot>

    <template v-if="custom">
      <input-validator
        :value="cpu"
        :rules="[
          validators.required('CPU is required.'),
          validators.isInt('CPU must be a valid integer.'),
          customCpuValidation(validators),
        ]"
        #="{ props }"
        ref="cpuInput"
      >
        <input-tooltip tooltip="The number of virtual cores allocated to your instance.">
          <v-text-field label="CPU (vCores)" type="number" v-model.number="cpu" v-bind="props" :disabled="disabled" />
        </input-tooltip>
      </input-validator>

      <input-validator
        :value="memory"
        :rules="[
          validators.required('Memory is required.'),
          validators.isInt('Memory must be a valid integer.'),
          customMemoryValidation(validators),
        ]"
        #="{ props }"
        ref="memoryInput"
      >
        <input-tooltip tooltip="The amount of RAM (Random Access Memory) allocated to your instance.">
          <v-text-field label="Memory (MB)" type="number" v-model.number="memory" v-bind="props" :disabled="disabled" />
        </input-tooltip>
      </input-validator>

      <input-validator
        :value="storage"
        :rules="[
          validators.required('Storage size is required.'),
          validators.isInt('Storage size must be a valid integer.'),
          customStorageValidation(validators),
        ]"
        #="{ props }"
        ref="storageInput"
      >
        <input-tooltip
          tooltip="The storage capacity allocated to your instance, indicating the amount of space available to store files, data, and applications."
        >
          <v-text-field
            label="Storage Size (GB)"
            type="number"
            v-model.number="storage"
            v-bind="props"
            :disabled="disabled"
          />
        </input-tooltip>
      </input-validator>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";

import type { Validators } from "../types";

const props = defineProps<{ network: string; type: string; disabled: boolean }>();
const emits = defineEmits<{
  (event: "update:cpu", value?: number): void;
  (event: "update:memory", value?: number): void;
  (event: "update:storage", value?: number): void;
}>();

const cpuInput = ref();
const memoryInput = ref();
const storageInput = ref();

const custom = ref(false);

const cpu = ref(2);
const memory = ref(4096);
const storage = ref(100);

watch(cpu, cpu => emits("update:cpu", cpu), { immediate: true });
watch(memory, memory => emits("update:memory", memory), { immediate: true });
watch(storage, storage => emits("update:storage", storage), { immediate: true });

watch(
  () => [props.network, props.type] as const,
  ([network, type]) => {
    const min = getMinCapacity(network, type);
    cpu.value = min.cpu;
    memory.value = min.memory;
    storage.value = min.storage;
  },
);

function customCpuValidation(validators: Validators) {
  return (value: string) => {
    const min = getMinCapacity(props.network, props.type);
    const maybeError = validators.min(`CPU min is ${min.cpu} cores.`, min.cpu)(value);
    return maybeError ? maybeError : validators.max("CPU max is 32 cores.", 32)(value);
  };
}

function customMemoryValidation(validators: Validators) {
  return (value: string) => {
    const min = getMinCapacity(props.network, props.type);
    const maybeError = validators.min(`Minimum allowed memory is ${min.memory} GB.`, min.memory)(value);
    return maybeError ? maybeError : validators.max("Maximum allowed memory is 256 GB.", 256 * 1024)(value);
  };
}

function customStorageValidation(validators: Validators) {
  return (value: string) => {
    const min = getMinCapacity(props.network, props.type);
    const maybeError = validators.min(`Minimum allowed storage size is ${min.storage} GB.`, min.storage)(value);
    return maybeError
      ? maybeError
      : validators.max(`Maximum allowed storage size is ${min.storage + 200} GB.`, min.storage + 200)(value);
  };
}

function getMinCapacity(network: string, type: string) {
  if (type == "relay" && network == "mainnet") {
    return { cpu: 4, memory: 1024 * 8, storage: 950 };
  }

  if (type == "indexer" && network == "testnet") {
    return { cpu: 4, memory: 1024 * 8, storage: 1300 };
  }

  if (type == "indexer" && network == "mainnet") {
    return { cpu: 4, memory: 1024 * 8, storage: 1500 };
  }

  return { cpu: 2, memory: 4 * 1024, storage: 100 };
}
</script>

<script lang="ts">
export default {
  name: "AlgorandCapacity",
};
</script>
