<template>
  <input-tooltip
    tooltip="A virtual machine (VM) image is a snapshot or template of a virtual machine that contains the necessary components to create and run a virtual instance of an operating system. It includes the operating system, installed applications, configurations, and any additional files or data required for the virtual machine, also you can put your own image/flist by choosing the other option."
  >
    <v-autocomplete
      label="VM Image"
      :items="[...$props.images, { name: 'Other' }]"
      return-object
      item-title="name"
      v-bind="props"
      v-model="image"
    />
  </input-tooltip>

  <template v-if="image.name === 'Other'">
    <input-validator
      :rules="[
        validators.required('Flist is required.'),
        validators.isURL('Flist must be a valid URL.', {
          protocols: ['https'],
        }),
      ]"
      :async-rules="image.name === 'Other' ? [isFlistExist] : []"
      :value="flist"
      #="{ props }"
    >
      <input-tooltip tooltip="Add a custom flist link, you can visit our 0-hub for more information.">
        <v-text-field label="Flist" v-model="flist" v-bind="props" />
      </input-tooltip>
    </input-validator>

    <input-validator :rules="[validators.required('Entry point is required.')]" :value="entryPoint" #="{ props }">
      <input-tooltip
        tooltip="The entry point of the selected flist. It's the first process that runs on the machine once it's deployed."
      >
        <v-text-field label="Entry Point" v-model="entryPoint" v-bind="props" />
      </input-tooltip>
    </input-validator>
  </template>
</template>

<script lang="ts" setup>
import { type PropType, ref, watch } from "vue";

import type { Flist } from "../types";

export interface VmImage {
  name: string;
  flist: string;
  entryPoint: string;
}
const props = defineProps({
  modelValue: {
    type: Object as PropType<Flist>,
    required: false,
  },
  images: {
    type: Array as PropType<VmImage[]>,
    required: true,
  },
});
const emits = defineEmits<{ (event: "update:model-value", value?: Flist): void }>();
const flist = ref<string>();
const entryPoint = ref<string>();

const image = ref<VmImage>(props.images[0]);
watch(
  image,
  vm => {
    if (vm.name !== "Other") {
      flist.value = vm.flist;
      entryPoint.value = vm.entryPoint;
    }
  },
  { immediate: true },
);

watch(
  [flist, entryPoint],
  ([value, entryPoint]) => {
    emits("update:model-value", value && entryPoint ? { value, entryPoint } : undefined);
  },
  { immediate: true, deep: true },
);

function isFlistExist(flist: string) {
  return fetch(flist + ".md5")
    .then(res => res.status !== 200)
    .then(invalid => {
      if (invalid) throw new Error();
    })
    .catch(() => {
      return { message: `Couldn't find flist with the provided url.`, isExist: false };
    });
}
</script>

<script lang="ts">
export default {
  name: "SelectVmImage",
};
</script>
