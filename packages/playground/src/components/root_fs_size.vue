<template>
  <div class="d-flex">
    <div :style="{ width: '100%' }" class="mr-4">
      <input-validator
        :value="value"
        :rules="[
          validators.required('SSD Storage is required.'),
          dynamicValidateRootFs(validators),
          validators.max('Maximum allowed SSD Storage is 10000 GB.', 10000),
        ]"
        ref="input"
        #="{ props }"
      >
        <v-text-field label="SSD Storage (GB)" type="number" :disabled="!edit" v-model.number="value" v-bind="props" />
      </input-validator>
    </div>

    <v-tooltip
      text="Allows adjusting the size of the root filesystem. The root filesystem is the primary storage location for the operating system and its associated files."
    >
      <template v-slot:activator="{ props }">
        <v-switch inset color="primary" v-model="edit" v-bind="props" />
      </template>
    </v-tooltip>
  </div>
</template>

<script lang="ts" setup>
import { calculateRootFileSystem } from "@threefold/grid_client";
import { ref, watch } from "vue";

import type { Validators } from "../types";

const props = defineProps<{ cpu?: number; memory?: number; modelValue?: number }>();
const emits = defineEmits<{ (event: "update:model-value", value: number): void }>();

const input = ref();

const value = ref(calculateRootFileSystem({ CPUCores: props.cpu ?? 0, RAMInMegaBytes: props.memory ?? 0 }));
watch(value, value => emits("update:model-value", value), { immediate: true });

const edit = ref(false);

watch(
  () => [edit.value, props.cpu || 0, props.memory || 0] as const,
  async ([edit, cpu, memory]) => {
    await input.value.validate(value.value);

    if (!edit) {
      value.value = calculateRootFileSystem({ CPUCores: cpu, RAMInMegaBytes: memory });
    }
  },
);

function dynamicValidateRootFs(validators: Validators) {
  return (value: string) => {
    const min = calculateRootFileSystem({ CPUCores: props.cpu ?? 0, RAMInMegaBytes: props.memory ?? 0 });
    return validators.min(`SSD Storage min value is ${min}GB.`, min)(value);
  };
}
</script>

<script lang="ts">
export default {
  name: "RootFsSize",
};
</script>
