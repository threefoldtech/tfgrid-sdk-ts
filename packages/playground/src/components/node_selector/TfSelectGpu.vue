<template>
  <VAutocomplete
    label="GPU Cards"
    placeholder="Select GPU Cards"
    multiple
    :model-value="$props.modelValue"
    @update:model-value="
      bindModelValue($event);
      bindStatus($event.length === 0 ? ValidatorStatus.Invalid : ValidatorStatus.Valid);
    "
    :items="(cardsTask.data as GPUCardInfo[])"
    item-title="device"
    :loading="cardsTask.loading"
    :error="!!cardsTask.error"
    :error-messages="
      $props.status === ValidatorStatus.Invalid ? 'Please select at least 1 GPU card.' : cardsTask.error?.message
    "
    return-object
    :disabled="!$props.validNode"
    :hint="$props.validNode ? undefined : 'Please select a valid node to load it\'s GPU cards.'"
    :persistent-hint="!$props.validNode"
    @update:menu="opened => !opened && $props.modelValue.length === 0 && bindStatus(ValidatorStatus.Invalid)"
  />
</template>

<script lang="ts">
import type { GPUCardInfo, NodeInfo } from "@threefold/grid_client";
import { onMounted, onUnmounted, type PropType } from "vue";

import { useAsync, useWatchDeep } from "../../hooks";
import { ValidatorStatus } from "../../hooks/form_validator";
import { useGrid } from "../../stores";
import { getNodeGpuCards } from "../../utils/nodeSelector";

export default {
  name: "TfSelectGpu",
  props: {
    modelValue: { type: Object as PropType<GPUCardInfo[]>, required: true },
    node: Object as PropType<NodeInfo>,
    validNode: Boolean,
    status: String as PropType<ValidatorStatus>,
  },
  emits: {
    "update:model-value": (cards: GPUCardInfo[]) => true || cards,
    "update:status": (status: ValidatorStatus) => true || status,
  },
  setup(props, ctx) {
    const gridStore = useGrid();
    const cardsTask = useAsync(getNodeGpuCards, { default: [] });

    useWatchDeep(
      () => [props.validNode, props.node],
      ([valid, node]) => {
        bindModelValue();
        if (valid && node) {
          return cardsTask.value.run(gridStore, node as NodeInfo);
        }
        bindStatus();
        cardsTask.value.initialized && cardsTask.value.reset();
      },
      { immediate: true, deep: true },
    );

    onUnmounted(() => {
      bindModelValue();
      bindStatus();
    });

    function bindModelValue(cards?: GPUCardInfo[]) {
      ctx.emit("update:model-value", cards || []);
    }

    onMounted(() => {
      bindModelValue();
      bindStatus();
    });
    function bindStatus(status?: ValidatorStatus) {
      ctx.emit("update:status", status || ValidatorStatus.Init);
    }

    return { ValidatorStatus, cardsTask, bindModelValue, bindStatus };
  },
};
</script>
