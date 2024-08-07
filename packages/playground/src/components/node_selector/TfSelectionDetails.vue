<template>
  <section class="mt-4">
    <template v-if="!disableNodeSelection">
      <h3 class="bg-primary pa-2 text-h6 rounded">Node Selection</h3>
      <p class="text-h6 mb-4 mt-2 ml-2">Choose a way to select Node</p>

      <v-radio-group v-model="wayToSelect" color="primary" inline>
        <InputTooltip
          align-center
          tooltip="Automatically select your node by filtering with Region, country, or farm name"
        >
          <v-radio label="Automated" value="automated"></v-radio>
        </InputTooltip>
        <InputTooltip align-center tooltip="Manually select your node by entering its id">
          <v-radio label="Manual" value="manual" class="ml-5"></v-radio>
        </InputTooltip>
      </v-radio-group>

      <div ref="input">
        <template v-if="wayToSelect === 'automated'">
          <TfSelectLocation v-model="location" title="Choose a Location" :status="NodeStatus.Up" />
          <TfSelectFarm :valid-filters="validFilters" :filters="filters" :location="location" v-model="farm" />
          <TfAutoNodeSelector
            :selected-machines="selectedMachines"
            :nodes-lock="nodesLock"
            :valid-filters="validFilters"
            :filters="filters"
            :location="location"
            :farm="farm"
            v-model="node"
            v-model:status="nodeStatus"
          />
        </template>

        <TfManualNodeSelector
          :selected-machines="selectedMachines"
          :nodes-lock="nodesLock"
          :valid-filters="validFilters"
          :filters="filters"
          v-model="node"
          v-model:status="nodeStatus"
          v-else
        />
      </div>

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
        :use-fqdn="$props.useFqdn"
        v-if="requireDomain"
      />
    </VExpandTransition>
  </section>
</template>

<script lang="ts">
import type { FarmInfo, GPUCardInfo, NodeInfo } from "@threefold/grid_client";
import { NodeStatus } from "@threefold/gridproxy_client";
import type AwaitLock from "await-lock";
import noop from "lodash/fp/noop.js";
import type { DeepPartial } from "utility-types";
import { computed, getCurrentInstance, onMounted, onUnmounted, type PropType, ref, watch } from "vue";

import { useWatchDeep } from "../../hooks";
import { useForm, ValidatorStatus } from "../../hooks/form_validator";
import type { InputValidatorService } from "../../hooks/input_validator";
import type {
  DomainInfo,
  SelectedLocation,
  SelectedMachine,
  SelectionDetails,
  SelectionDetailsFilters,
  SelectionDetailsFiltersValidators,
} from "../../types/nodeSelector";
import { createSelectionDetailsFiltersValidator } from "../../utils/nodeSelector";
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
    filtersValidators: {
      type: Object as PropType<DeepPartial<SelectionDetailsFiltersValidators>>,
      default: () => ({}),
    },
    requireDomain: Boolean,
    disableNodeSelection: { type: Boolean, default: () => false },
    status: String as PropType<ValidatorStatus>,
    useFqdn: Boolean,
    selectedMachines: {
      type: Array as PropType<SelectedMachine[]>,
      default: () => [],
    },
    nodesLock: Object as PropType<AwaitLock>,
  },
  emits: {
    "update:model-value": (value: SelectionDetails) => true || value,
    "update:status": (value: ValidatorStatus) => true || value,
  },
  setup(props, ctx) {
    const input = ref<HTMLElement>();
    const filtersValidator = computed(() => createSelectionDetailsFiltersValidator(props.filtersValidators));
    const validFilters = computed(() => filtersValidator.value.safeParse(props.filters).success);

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
        validFilters: validFilters.value,
        node: node.value,
        farm: farm.value,
        gpuCards: gpuCards.value,
        location: location.value,
        domain: domain.value,
      } as SelectionDetails;
    });
    useWatchDeep(selectionDetails, bindModelValue, { immediate: true, deep: true });

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
    };

    onMounted(() => form?.register(uid.toString(), fakeService));
    onUnmounted(() => form?.unregister(uid.toString()));

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
        fakeService.status = status;
        form?.updateStatus(uid.toString(), status);
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
      input,
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
      NodeStatus,
    };
  },
};
</script>
