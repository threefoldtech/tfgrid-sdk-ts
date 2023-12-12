<template>
  <section>
    <h6 class="text-h5 mb-4 mt-2">Domain Name</h6>

    <!-- <VSwitch color="primary" inset label="Custom Domain" v-model="enableCustomDomain" /> -->

    <VAutocomplete label="Select domain" placeholder="Select a domain" :items="[]" />
  </section>
</template>

<script lang="ts">
import type { FarmInfo, NodeInfo } from "@threefold/grid_client";
import { computed, type PropType, ref, watch } from "vue";

import { useAsync, useWatchDeep } from "../../hooks";
import { useGrid } from "../../stores";
import type { NodeSelectorFilters, SelectedLocation } from "../../types/nodeSelector";
import {
  createPageGen,
  getNodePageCount,
  loadNodes,
  normalizeNodeFilters,
  normalizeNodeOptions,
} from "../../utils/nodeSelector";

export default {
  name: "TfDomainName",
  props: {
    filters: {
      type: Object as PropType<NodeSelectorFilters>,
      required: true,
    },
    location: {
      type: Object as PropType<SelectedLocation>,
      required: true,
    },
    farm: {
      type: Object as PropType<FarmInfo>,
      required: true,
    },
  },
  setup(props) {
    const gridStore = useGrid();

    const loadedDomains = ref<NodeInfo[]>([]);
    const domainsTask = useAsync(loadNodes, {
      onAfterTask({ data }) {
        loadedDomains.value = loadedDomains.value.concat(data as NodeInfo[]);
        nextPage();
      },
      default: [],
    });

    const pageCountTask = useAsync(getNodePageCount, { default: 1 });
    const page = ref(-1);
    let pageGen: ReturnType<typeof createPageGen>;
    function nextPage() {
      page.value = pageGen?.next().value ?? -1;
    }

    const options = computed(() => normalizeNodeOptions(gridStore, props.location, page, props.farm, true));
    const filters = computed(() => normalizeNodeFilters(props.filters, options.value));

    let w = 0;
    watch(filters, () => console.log("watch", ++w), { immediate: true, deep: true });

    let d = 0;
    useWatchDeep(filters, () => console.log("watchDeep", ++d), { immediate: true, debounce: 500, deep: true });
    // const enableCustomDomain = ref(false);
    // const selectedDomain = ref()

    return {
      /* enableCustomDomain */
    };
  },
};
</script>
