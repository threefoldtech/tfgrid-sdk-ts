<template>
  <VAutocomplete
    label="GPU Cards"
    placeholder="Select GPU Cards"
    multiple
    :model-value="$props.modelValue"
    @update:model-value="$emit('update:model-value', $event)"
    :items="(cardsTask.data as GPUCardInfo[])"
    item-title="device"
    :loading="cardsTask.loading"
    :error="!!cardsTask.error"
    :error-messages="cardsTask.error?.message"
    return-object
    :disabled="!$props.validNode"
    :hint="$props.validNode ? undefined : 'Please select a valid node to load it\'s GPU cards.'"
    :persistent-hint="!$props.validNode"
  />
</template>

<script lang="ts">
import type { GPUCardInfo, NodeInfo } from "@threefold/grid_client";
import type { PropType } from "vue";

import { useAsync, useWatchDeep } from "../../hooks";
import { useGrid } from "../../stores";
import { getNodeGpuCards } from "../../utils/nodeSelector";

export default {
  name: "TfSelectGpu",
  props: {
    modelValue: { type: Object as PropType<GPUCardInfo[]>, required: true },
    node: Object as PropType<NodeInfo>,
    validNode: { type: Boolean, required: true },
  },
  emits: {
    "update:model-value": (cards: GPUCardInfo[]) => true || cards,
  },
  setup(props, ctx) {
    const gridStore = useGrid();
    const cardsTask = useAsync(getNodeGpuCards, { default: [] });

    useWatchDeep(
      () => [props.validNode, props.node],
      ([valid, node]) => {
        ctx.emit("update:model-value", []);
        if (valid && node) {
          return cardsTask.value.run(gridStore, node as NodeInfo);
        }
        cardsTask.value.initialized && cardsTask.value.reset();
      },
      { immediate: true, deep: true },
    );

    return { cardsTask };
  },
};
</script>
