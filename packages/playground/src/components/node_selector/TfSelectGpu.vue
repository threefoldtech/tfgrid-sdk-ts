<template>
  <v-alert class="mb-4 mx-4" type="info" variant="tonal"> Choose GPU card to deploy your VM. </v-alert>
  <div ref="input">
    <input-tooltip
      tooltip="Please select at least one card from the available GPU cards. Note that if you have a deployment that already uses certain cards, they will not appear in the selection area. You have the option to select one or more cards.."
    >
      <VAutocomplete
        label="GPU Cards"
        placeholder="Select GPU Cards"
        class="w-100"
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
    </input-tooltip>
  </div>
</template>

<script lang="ts">
import type { GPUCardInfo, NodeInfo } from "@threefold/grid_client";
import { noop } from "lodash";
import { getCurrentInstance, onMounted, onUnmounted, type PropType, ref } from "vue";

import type { InputValidatorService } from "@/hooks/input_validator";

import { useAsync, useWatchDeep } from "../../hooks";
import { useForm, ValidatorStatus } from "../../hooks/form_validator";
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
    const input = ref<HTMLElement>();
    const cardsTask = useAsync(getNodeGpuCards, { default: [] });

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

    /* Adapter to work with old code validation */
    const { uid } = getCurrentInstance() as { uid: number };
    const form = useForm();

    const fakeService: InputValidatorService = {
      validate: () => Promise.resolve(true),
      setStatus: noop,
      reset: noop,
      status: ValidatorStatus.Init,
      error: null,
      $el: input,
    };

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

    onMounted(() => form?.register(uid.toString(), fakeService));
    onUnmounted(() => form?.unregister(uid.toString()));

    function bindStatus(status?: ValidatorStatus) {
      const s = status || ValidatorStatus.Init;
      fakeService.status = s;
      form?.updateStatus(uid.toString(), s);
      ctx.emit("update:status", s);
    }

    return { input, ValidatorStatus, cardsTask, bindModelValue, bindStatus };
  },
};
</script>
