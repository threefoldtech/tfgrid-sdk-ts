<template>
  <section>
    <template v-if="!disableNodeSelection">
      <h3 class="bg-primary pa-2 text-h6 rounded">Node Selection</h3>
      <p class="text-h6 mb-4 mt-2 ml-2">Choose a way to select Node</p>

      <v-radio-group v-model="wayToSelect" color="primary" inline>
        <v-radio label="Automated" value="automated" class="mr-6"></v-radio>
        <v-radio label="Manual" value="manual"></v-radio>
      </v-radio-group>

      <template v-if="wayToSelect === 'automated'">
        <TfSelectLocation v-model="location" v-if="wayToSelect === 'automated'" />
        <TfSelectFarm
          :valid-filters="validFilters"
          :filters="filters"
          :location="location"
          v-model="farm"
          v-if="wayToSelect === 'automated'"
        />
        <TfAutoNodeSelector
          :valid-filters="validFilters"
          :filters="filters"
          :location="location"
          :farm="farm"
          v-model="node"
          v-model:status="nodeStatus"
          v-if="wayToSelect === 'automated'"
        />
      </template>
      <TfManualNodeSelector
        :valid-filters="validFilters"
        :filters="filters"
        v-model="node"
        v-model:status="nodeStatus"
        v-else
      />

      <VExpandTransition>
        <TfSelectGpu
          :node="node"
          :valid-node="nodeStatus === ValidatorStatus.Valid"
          v-model="gpuCards"
          v-model:status="gpuStatus"
          v-if="filters.hasGPU"
        />
      </VExpandTransition>
    </template>

    <VExpandTransition>
      <TfDomainName
        :filters="filters"
        :farm="farm"
        :hide-title="$props.disableNodeSelection"
        v-model="domain"
        v-model:status="domainStatus"
        v-if="requireDomain"
      />
    </VExpandTransition>
  </section>
</template>

<script lang="ts">
import type { FarmInfo, GPUCardInfo, NodeInfo } from "@threefold/grid_client";
import noop from "lodash/fp/noop.js";
import { computed, getCurrentInstance, onMounted, onUnmounted, type PropType, ref, watch } from "vue";

import { useForm, ValidatorStatus } from "../../hooks/form_validator";
import type { InputValidatorService } from "../../hooks/input_validator";
import type { DomainInfo, SelectedLocation, SelectionDetails, SelectionDetailsFilters } from "../../types/nodeSelector";
import { isValidSelectionDetailsFilters } from "../../utils/nodeSelector";
import TfAutoNodeSelector from "./TfAutoNodeSelector.vue";
import TfDomainName from "./TfDomainName.vue";
import TfManualNodeSelector from "./TfManualNodeSelector.vue";
import TfSelectFarm from "./TfSelectFarm.vue";
import TfSelectGpu from "./TfSelectGpu.vue";
import TfSelectLocation from "./TfSelectLocation.vue";

export default {
  name: "TfSelectionDetails",
  components: { TfSelectLocation, TfSelectFarm, TfAutoNodeSelector, TfManualNodeSelector, TfSelectGpu, TfDomainName },
  props: {
    modelValue: Object as PropType<SelectionDetails>,
    filters: {
      type: Object as PropType<SelectionDetailsFilters>,
      default: () => ({}),
    },
    requireDomain: Boolean,
    disableNodeSelection: { type: Boolean, default: () => false },
    status: String as PropType<ValidatorStatus>,
  },
  emits: {
    "update:model-value": (value: SelectionDetails) => true || value,
    "update:status": (value: ValidatorStatus) => true || value,
  },
  setup(props, ctx) {
    const validFilters = computed(() => isValidSelectionDetailsFilters(props.filters));

    const wayToSelect = ref<"manual" | "automated">("automated");
    const location = ref<SelectedLocation>();
    const farm = ref<FarmInfo>();

    const node = ref<NodeInfo>();
    const nodeStatus = ref<ValidatorStatus>();

    const gpuCards = ref<GPUCardInfo[]>([]);
    const gpuStatus = ref<ValidatorStatus>();

    const domain = ref<DomainInfo>();
    const domainStatus = ref<ValidatorStatus>();

    const selectionDetails = computed(() => {
      return {
        type: wayToSelect.value,
        node: node.value,
        farm: farm.value,
        gpuCards: gpuCards.value,
        location: location.value,
        domain: domain.value,
      } as SelectionDetails;
    });
    watch(selectionDetails, bindModelValue, { immediate: true, deep: true });

    /* Adapter to work with old code validation */
    const { uid } = getCurrentInstance() as { uid: number };
    const form = useForm();

    const fakeService: InputValidatorService = {
      validate: () => Promise.resolve(true),
      setStatus: noop,
      reset: noop,
      status: ValidatorStatus.Init,
      error: null,
    };

    onMounted(() => form?.register(uid, fakeService));
    onUnmounted(() => form?.unregister(uid));

    const invalid = computed(() => {
      return (
        (!props.disableNodeSelection && nodeStatus.value === ValidatorStatus.Invalid) ||
        (props.requireDomain && domainStatus.value === ValidatorStatus.Invalid) ||
        (props.filters.hasGPU && gpuStatus.value === ValidatorStatus.Invalid)
      );
    });

    const pending = computed(() => {
      return (
        (!props.disableNodeSelection && nodeStatus.value === ValidatorStatus.Pending) ||
        (props.requireDomain && domainStatus.value === ValidatorStatus.Pending) ||
        (props.filters.hasGPU && gpuStatus.value === ValidatorStatus.Pending)
      );
    });

    const valid = computed(() => {
      return (
        (props.disableNodeSelection || (!props.disableNodeSelection && nodeStatus.value === ValidatorStatus.Valid)) &&
        (!props.requireDomain || (props.requireDomain && domainStatus.value === ValidatorStatus.Valid)) &&
        (!props.filters.hasGPU || (props.filters.hasGPU && gpuStatus.value === ValidatorStatus.Valid))
      );
    });

    const status = computed(() => {
      if (invalid.value) return ValidatorStatus.Invalid;
      if (pending.value) return ValidatorStatus.Pending;
      if (valid.value) return ValidatorStatus.Valid;
      return ValidatorStatus.Init;
    });

    watch(
      status,
      status => {
        form?.updateStatus(uid, status);
        bindStatus(status);
      },
      { deep: true, immediate: true },
    );

    function bindModelValue(value: SelectionDetails): void {
      ctx.emit("update:model-value", value);
    }

    onUnmounted(bindStatus);
    function bindStatus(status?: ValidatorStatus): void {
      ctx.emit("update:status", status || ValidatorStatus.Init);
    }

    return {
      validFilters,
      ValidatorStatus,
      wayToSelect,
      location,
      farm,
      node,
      nodeStatus,
      gpuCards,
      gpuStatus,
      domain,
      domainStatus,
      selectionDetails,
    };
  },
};
</script>
