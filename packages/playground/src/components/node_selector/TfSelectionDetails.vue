<template>
  <section>
    <h3 class="bg-primary pa-2 text-h6 rounded">Node Selection</h3>
    <p class="text-h6 mb-4 mt-2 ml-2">Choose a way to select Node</p>

    <v-radio-group v-model="wayToSelect" color="primary" inline>
      <v-radio label="Automated" value="automated" class="mr-6"></v-radio>
      <v-radio label="Manual" value="manual"></v-radio>
    </v-radio-group>

    <template v-if="wayToSelect === 'automated'">
      location {{ location }}
      <TfSelectLocation v-model="location" v-if="wayToSelect === 'automated'" />

      farm {{ farm }}
      <TfSelectFarm :filters="filters" :location="location" v-model="farm" v-if="wayToSelect === 'automated'" />

      <TfAutoNodeSelector
        :filters="filters"
        :location="location"
        :farm="farm"
        v-model="node"
        v-model:status="nodeStatus"
        v-if="wayToSelect === 'automated'"
      />
    </template>

    <TfManualNodeSelector :filters="filters" v-model="node" v-model:status="nodeStatus" v-else />

    <VExpandTransition>
      <TfSelectGpu
        :node="node"
        :valid-node="nodeStatus === ValidatorStatus.Valid"
        v-model="gpuCards"
        v-model:status="gpuStatus"
        v-if="filters.hasGPU"
      />
    </VExpandTransition>

    <VExpandTransition>
      <TfDomainName
        :filters="filters"
        :location="location"
        :farm="farm"
        v-model="domain"
        v-model:status="domainStatus"
        v-if="filters.gateway"
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
import type { DomainInfo, NodeSelectorFilters, SelectedLocation, SelectionDetails } from "../../types/nodeSelector";
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
      type: Object as PropType<NodeSelectorFilters>,
      default: () => ({}),
    },
    status: String as PropType<ValidatorStatus>,
  },
  emits: {
    "update:model-value": (value: SelectionDetails) => true || value,
    "update:status": (value: ValidatorStatus) => true || value,
  },
  setup(props, ctx) {
    const wayToSelect = ref<"manual" | "automated">("automated");
    const location = ref<SelectedLocation>();
    const farm = ref<FarmInfo>();

    const node = ref<NodeInfo>();
    const nodeStatus = ref(ValidatorStatus.Init);

    const gpuCards = ref<GPUCardInfo[]>([]);
    const gpuStatus = ref(ValidatorStatus.Init);

    const domain = ref<DomainInfo>();
    const domainStatus = ref(ValidatorStatus.Init);

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
    watch(selectionDetails, s => ctx.emit("update:model-value", s), { immediate: true, deep: true });

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

    // update status
    const invalid = computed(() => {
      return (
        nodeStatus.value === ValidatorStatus.Invalid ||
        (props.filters.gateway && domainStatus.value === ValidatorStatus.Invalid) ||
        (props.filters.hasGPU && gpuStatus.value === ValidatorStatus.Invalid)
      );
    });

    const pending = computed(() => {
      return (
        nodeStatus.value === ValidatorStatus.Pending ||
        (props.filters.gateway && domainStatus.value === ValidatorStatus.Pending) ||
        (props.filters.hasGPU && gpuStatus.value === ValidatorStatus.Pending)
      );
    });

    const valid = computed(() => {
      return (
        nodeStatus.value === ValidatorStatus.Valid &&
        (!props.filters.gateway || (props.filters.gateway && domainStatus.value === ValidatorStatus.Valid)) &&
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
        ctx.emit("update:status", status);
      },
      { deep: true, immediate: true },
    );

    return {
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
