<template>
  <section>
    <h6 class="text-h5 mb-4 mt-2">Domain Name</h6>

    <VSwitch color="primary" inset label="Custom Domain" v-model="enableCustomDomain" hide-details />

    <VForm v-model="domainNameValid">
      <VExpandTransition>
        <VTextField
          ref="customDomainInput"
          label="Custom Domain"
          placeholder="Your custom domain"
          v-model="customDomain"
          validate-on="input"
          :rules="[
            d => (d ? true : 'Domain name is required.'),
            d => {
              const err = validators.isFQDN('Please provide a valid domain name.')(d);
              return err?.message || true;
            },
          ]"
          v-if="enableCustomDomain"
          @blur="($refs.customDomainInput as VInput).validate()"
        />
      </VExpandTransition>

      <VAutocomplete
        ref="domainInput"
        validate-on="input"
        label="Select domain"
        placeholder="Select a domain"
        :items="loadedDomains"
        item-title="publicConfig.domain"
        v-model="selectedDomain"
        :rules="[d => (d ? true : 'Domain is required.')]"
        @update:menu="opened => !opened && $nextTick().then(($refs.domainInput as VInput).validate)"
        @blur="$nextTick().then(($refs.domainInput as VInput).validate)"
      >
        <template #append-item v-if="page !== -1">
          <VContainer>
            <VBtn
              @click="reloadDomains()"
              block
              color="secondary"
              variant="tonal"
              :loading="domainsTask.loading"
              prepend-icon="mdi-reload"
            >
              Load More Domains
            </VBtn>
          </VContainer>
        </template>
      </VAutocomplete>
    </VForm>
  </section>
</template>

<script lang="ts">
import type { FarmInfo, NodeInfo } from "@threefold/grid_client";
import { computed, type PropType, ref, watch } from "vue";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { VInput } from "vuetify/components/VInput";

import { useAsync, useWatchDeep } from "../../hooks";
import { useGrid } from "../../stores";
import type { DomainInfo, NodeSelectorFilters, SelectedLocation } from "../../types/nodeSelector";
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
    modelValue: Object as PropType<DomainInfo>,
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
    valid: Boolean,
  },
  emits: {
    "update:model-value": (domain: DomainInfo) => true || domain,
    "update:valid": (valid: boolean) => true || valid,
  },
  setup(props, ctx) {
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

    const reloadDomains = () => domainsTask.value.run(gridStore, filters.value);

    useWatchDeep(
      filters,
      async filters => {
        await pageCountTask.value.run(gridStore, filters);
        pageGen = createPageGen(pageCountTask.value.data as number);
        nextPage();
        loadedDomains.value = [];
        return reloadDomains();
      },
      {
        immediate: true,
        debounce: 500,
        deep: true,
        ignoreFields: ["page"],
      },
    );
    const enableCustomDomain = ref(false);
    const customDomain = ref("");
    const selectedDomain = ref<NodeInfo | null>(null);

    const domainNameValid = ref(false);
    watch(domainNameValid, valid => ctx.emit("update:valid", valid), { immediate: true });

    useWatchDeep(
      () =>
        ({
          selectedDomain: selectedDomain.value,
          enabledCustomDomain: enableCustomDomain.value,
          customDomain: customDomain.value,
        } as DomainInfo),
      domain => ctx.emit("update:model-value", domain),
      { immediate: true, deep: true },
    );

    return {
      page,

      domainNameValid,

      enableCustomDomain,
      customDomain,

      domainsTask,
      loadedDomains,
      selectedDomain,
      reloadDomains,
    };
  },
};
</script>
