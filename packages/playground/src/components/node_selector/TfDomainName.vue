<template>
  <section>
    <h6 class="text-h5 mb-4 mt-2">Domain Name</h6>

    <input-tooltip tooltip="Use a custom domain">
      <div>
        <VSwitch color="primary" inset label="Custom Domain" v-model="enableCustomDomain" hide-details />
      </div>
    </input-tooltip>

    <VForm v-model="domainNameValid">
      <input-tooltip tooltip="Domain Name that will points to this instance" v-if="enableCustomDomain">
        <VExpandTransition>
          <VTextField
            ref="customDomainInput"
            label="Custom Domain"
            placeholder="Your custom domain"
            v-model="customDomain"
            validate-on="input"
            :rules="[
              d => (d ? true : 'Domain name is required.'),
              d => validators.isFQDN('Please provide a valid domain name.')(d)?.message || true,
            ]"
            @blur="($refs.customDomainInput as VInput).validate()"
          />
        </VExpandTransition>
      </input-tooltip>

      <input-tooltip
        tooltip="Creates a subdomain for your instance on the selected domain to be able to access your instance from the browser."
      >
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
      </input-tooltip>
    </VForm>
  </section>
</template>

<script lang="ts">
import type { FarmInfo, FilterOptions, NodeInfo } from "@threefold/grid_client";
import { computed, nextTick, onUnmounted, type PropType, ref, watch } from "vue";
import { onMounted } from "vue";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { VInput } from "vuetify/components/VInput";

import { useAsync, useWatchDeep } from "../../hooks";
import { ValidatorStatus } from "../../hooks/form_validator";
import { useGrid } from "../../stores";
import type { DomainInfo, NodeSelectorFilters, SelectedLocation } from "../../types/nodeSelector";
import { createPageGen, getNodePageCount, loadNodes } from "../../utils/nodeSelector";

export default {
  name: "TfDomainName",
  props: {
    modelValue: Object as PropType<DomainInfo>,
    filters: {
      type: Object as PropType<NodeSelectorFilters>,
      required: true,
    },
    location: Object as PropType<SelectedLocation>,
    farm: Object as PropType<FarmInfo>,
    status: String as PropType<ValidatorStatus>,
  },
  emits: {
    "update:model-value": (domain?: DomainInfo) => true || domain,
    "update:status": (status: ValidatorStatus) => true || status,
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

    const enableCustomDomain = ref(false);
    const filters = computed<FilterOptions>(() => ({
      gateway: true,
      size: window.env.PAGE_SIZE,
      page: Math.max(1, page.value),
      farmId: enableCustomDomain.value ? props.farm?.farmId : undefined,
      availableFor: gridStore.client.twinId,
    }));

    const reloadDomains = () => domainsTask.value.run(gridStore, filters.value);

    useWatchDeep(
      filters,
      async filters => {
        await pageCountTask.value.run(gridStore, filters);
        pageGen = createPageGen(pageCountTask.value.data as number);
        nextPage();
        await nextTick();
        loadedDomains.value = [];
        return reloadDomains();
      },
      {
        immediate: true,
        deep: true,
        ignoreFields: ["page"],
      },
    );
    const customDomain = ref("");
    const selectedDomain = ref<NodeInfo | null>(null);

    const domainNameValid = ref<boolean | null>(null);
    watch(domainNameValid, valid => {
      bindStatus(valid === null ? ValidatorStatus.Init : valid ? ValidatorStatus.Valid : ValidatorStatus.Invalid);
    });

    useWatchDeep(
      () =>
        ({
          selectedDomain: selectedDomain.value,
          enabledCustomDomain: enableCustomDomain.value,
          customDomain: customDomain.value,
        } as DomainInfo),
      domain => bindModelValue(domain),
      { immediate: true, deep: true },
    );

    onUnmounted(() => {
      bindModelValue();
      bindStatus();
    });

    function bindModelValue(domain?: DomainInfo): void {
      ctx.emit("update:model-value", domain);
    }

    onMounted(bindStatus);
    function bindStatus(status?: ValidatorStatus): void {
      ctx.emit("update:status", status || ValidatorStatus.Init);
    }

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
