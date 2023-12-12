<template>
  <section>
    <h3 class="bg-primary pa-2 text-h6 rounded">Node Selection</h3>
    <p class="text-h6 mb-4 mt-2 ml-2">Choose a way to select Node</p>

    <v-radio-group v-model="wayToSelect" color="primary" inline>
      <v-radio label="Automated" value="automated" class="mr-6"></v-radio>
      <v-radio label="Manual" value="manual"></v-radio>
    </v-radio-group>

    <template v-if="wayToSelect === 'automated'">
      <TfSelectLocation v-model="location" />
      <TfSelectFarm :filters="filters" :location="location" v-model="farm" />
      <TfAutoNodeSelector
        :filters="filters"
        :location="location"
        :farm="farm"
        v-model="node"
        v-model:valid="validNode"
      />
    </template>

    <template v-else>Manual (not yet implemented)</template>

    <VExpandTransition>
      <TfSelectGpu :node="node" :valid-node="validNode" v-if="filters.hasGPU" v-model="gpuCards" />
    </VExpandTransition>

    <VExpandTransition>
      <TfDomainName
        :filters="filters"
        :location="location"
        :farm="farm"
        v-model="domain"
        v-model:valid="validDomain"
        v-if="filters.gateway"
      />
    </VExpandTransition>
  </section>
</template>

<script lang="ts">
import type { FarmInfo, GPUCardInfo, NodeInfo } from "@threefold/grid_client";
import noop from "lodash/fp/noop.js";
import { computed, getCurrentInstance, onMounted, onUnmounted, type PropType, type Ref, ref, watch } from "vue";

import { useForm, ValidatorStatus } from "../../hooks/form_validator";
import type { InputValidatorService } from "../../hooks/input_validator";
import type { DomainInfo, NodeSelectorFilters, SelectedLocation } from "../../types/nodeSelector";
import TfAutoNodeSelector from "./TfAutoNodeSelector.vue";
import TfDomainName from "./TfDomainName.vue";
import TfSelectFarm from "./TfSelectFarm.vue";
import TfSelectGpu from "./TfSelectGpu.vue";
import TfSelectLocation from "./TfSelectLocation.vue";

export default {
  name: "TfSelectNode",
  components: { TfSelectLocation, TfSelectFarm, TfAutoNodeSelector, TfSelectGpu, TfDomainName },
  props: {
    filters: {
      type: Object as PropType<NodeSelectorFilters>,
      default: () => ({}),
    },
    valid: Boolean,
  },
  emits: {
    "update:valid": (valid: boolean) => true || valid,
  },
  setup(props, ctx) {
    const wayToSelect = ref<"manual" | "automated">("automated");
    const location = ref<SelectedLocation>({});
    const farm = ref({}) as Ref<FarmInfo>;

    const node = ref<NodeInfo>();
    const validNode = ref(false);
    const gpuCards = ref<GPUCardInfo[]>([]);

    const domain = ref<DomainInfo>();
    const validDomain = ref(false);

    /* Adapter to work with old code validation */
    const { uid } = getCurrentInstance() as { uid: number };
    const form = useForm();
    const valid = computed(() => validNode.value && (!props.filters.gateway || validDomain.value));

    const fakeService: InputValidatorService = {
      validate: () => Promise.resolve(valid.value),
      setStatus: noop,
      reset: noop,
      status: ValidatorStatus.Init,
      error: null,
    };

    onMounted(() => form?.register(uid, fakeService));
    onUnmounted(() => form?.unregister(uid));
    watch(
      valid,
      valid => {
        form?.updateStatus(uid, valid ? ValidatorStatus.Valid : ValidatorStatus.Invalid);
        ctx.emit("update:valid", valid);
      },
      { immediate: true },
    );

    return { wayToSelect, location, farm, node, validNode, gpuCards, domain, validDomain };
  },
};
</script>
