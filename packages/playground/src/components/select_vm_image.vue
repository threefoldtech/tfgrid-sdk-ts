<template>
  <input-tooltip
    tooltip="A virtual machine (VM) image is a snapshot or template of a virtual machine that contains the necessary components to create and run a virtual instance of an operating system. It includes the operating system, installed applications, configurations, and any additional files or data required for the virtual machine, also you can put your own image/flist by choosing the other option."
  >
    <v-select
      v-bind="props"
      v-model="image"
      label="Image"
      :items="[...$props.images, { name: 'Other' }]"
      return-object
      item-title="name"
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
        <v-text-field
          v-model="flist"
          label="Flist"
          v-bind="props"
        />
      </input-tooltip>
    </input-validator>

    <input-tooltip
      tooltip="The entry point of the selected flist. It's the first process that runs on the machine once it's deployed."
    >
      <v-text-field
        v-model="entryPoint"
        label="Entry Point"
      />
    </input-tooltip>
  </template>
</template>

<script lang="ts" setup>
import { computed, type PropType, ref, watch } from "vue";

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

const image = ref<VmImage>(props.images[0]);
const name = computed(() => image.value.name);

const flist = computed({
  get() {
    if (name.value != "Other") {
      return image.value.flist;
    }

    return image.value.flist;
  },
  set(newValue) {
    image.value.flist = newValue;
  },
});

const entryPoint = computed({
  get() {
    if (name.value != "Other") {
      return image.value.entryPoint;
    }
    return image.value.entryPoint;
  },
  set(value) {
    image.value.entryPoint = value;
  },
});

watch(
  [flist, entryPoint, name],
  ([value, entryPoint, name]) => {
    emits("update:model-value", value ? { name, value, entryPoint } : undefined);
  },
  { immediate: true, deep: true },
);

async function isFlistExist(flist: string) {
  if (flist.includes(".flist")) {
    try {
      const res = await fetch(flist + ".md5");
      if (res.status !== 200) throw new Error();
    } catch (error) {
      return { message: `Couldn't find flist with the provided url.`, isExist: false };
    }
  } else {
    if (!flist.endsWith(".fl")) {
      return { message: `Not a supported flist url` };
    }
  }
}
</script>

<script lang="ts">
export default {
  name: "SelectVmImage",
};
</script>
