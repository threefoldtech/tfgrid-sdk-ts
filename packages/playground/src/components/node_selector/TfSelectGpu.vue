<template>
  <v-alert class="mb-4" type="info" variant="tonal"> Choose a GPU card to deploy your VM. </v-alert>
  <div ref="input" class="gpu-card-selector" data-validation-target="gpu-cards">
    <input-tooltip
      tooltip="Please select at least one card from the available GPU cards. Note that if you have a deployment that already uses certain cards, they will not appear in the selection area. You have the option to select one or more cards.."
    >
      <VSelect
        ref="gpuSelect"
        label="GPU Cards"
        placeholder="Select GPU Cards"
        class="w-100"
        multiple
        :model-value="$props.modelValue"
        item-value="id"
        :items="cardsTask.data as GPUCardInfo[]"
        item-title="device"
        :loading="cardsTask.loading"
        :error="!!cardsTask.error"
        :error-messages="
          $props.status === ValidatorStatus.Invalid ? 'Please select at least 1 GPU card.' : cardsTask.error?.message
        "
        no-data-text="No GPU cards available on the selected node."
        return-object
        :disabled="!$props.validNode"
        :hint="$props.validNode ? undefined : 'Please select a valid node to load its GPU cards.'"
        :persistent-hint="!$props.validNode"
        @update:model-value="
          bindModelValue($event);
          bindStatus();
        "
        @update:menu="
          opened => !opened && $props.modelValue.length === 0 && $props.validNode && bindStatus(ValidatorStatus.Invalid)
        "
      />
    </input-tooltip>
  </div>
</template>

<script lang="ts">
import type { GPUCardInfo, NodeInfo } from "@threefold/grid_client";
import noop from "lodash/fp/noop.js";
import { getCurrentInstance, onMounted, onUnmounted, type PropType, ref } from "vue";

import type { InputValidatorService } from "@/hooks/input_validator";

import { useAsync, useWatchDeep } from "../../hooks";
import { useForm, ValidatorStatus } from "../../hooks/form_validator";
import { useGrid } from "../../stores";
import { getNodeAvailableGpuCards } from "../../utils/nodeSelector";

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
    const gpuSelect = ref<HTMLElement>();
    const cardsTask = useAsync(getNodeAvailableGpuCards, { default: [] });

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
      highlightOnError: true,
      validationTarget: "gpu-cards",
    };

    const registrationId = uid.toString();
    let isRegistered = false;

    const registerService = () => {
      if (!isRegistered && form) {
        form.register(registrationId, fakeService);
        isRegistered = true;
      }
    };

    const unregisterService = () => {
      if (isRegistered && form) {
        form.unregister(registrationId);
        isRegistered = false;
      }
    };

    onMounted(() => {
      if (props.validNode && props.node) {
        registerService();
      }
    });

    onUnmounted(() => {
      unregisterService();
    });

    useWatchDeep(
      () => [props.validNode, props.node],
      ([valid, node]) => {
        bindModelValue();
        if (valid && node) {
          registerService();
          return cardsTask.value.run(gridStore, node as NodeInfo);
        } else {
          unregisterService();
          bindStatus(ValidatorStatus.Init);
          cardsTask.value.initialized && cardsTask.value.reset();
        }
      },
      { immediate: true, deep: true },
    );

    useWatchDeep(
      () => props.modelValue,
      cards => {
        if (props.validNode && props.node) {
          bindStatus(cards.length === 0 ? ValidatorStatus.Invalid : ValidatorStatus.Valid);
        } else {
          bindStatus(ValidatorStatus.Init);
        }
      },
      { immediate: true, deep: true },
    );

    function bindStatus(status?: ValidatorStatus) {
      let s = status;

      if (!s) {
        if (props.validNode && props.node) {
          s = props.modelValue.length === 0 ? ValidatorStatus.Invalid : ValidatorStatus.Valid;
        } else {
          s = ValidatorStatus.Init;
        }
      }

      fakeService.status = s;
      if (isRegistered) {
        form?.updateStatus(registrationId, s);
      }
      ctx.emit("update:status", s);
    }

    return { input, gpuSelect, ValidatorStatus, cardsTask, bindModelValue, bindStatus };
  },
};
</script>
