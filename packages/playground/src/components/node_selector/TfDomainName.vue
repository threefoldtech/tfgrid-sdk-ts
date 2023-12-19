<template>
  <section>
    <h6 class="text-h5 mb-4 mt-2" v-if="!hideTitle">Domain Name</h6>

    <input-tooltip tooltip="Use a custom domain">
      <div>
        <VSwitch color="primary" inset label="Custom Domain" v-model="enableCustomDomain" hide-details />
      </div>
    </input-tooltip>

    <VForm v-model="domainNameValid">
      <VExpandTransition>
        <input-tooltip tooltip="Domain Name that will points to this instance" v-if="enableCustomDomain">
          <VTextField
            ref="customDomainInput"
            label="Custom Domain"
            placeholder="Your custom domain"
            v-model="customDomain"
            @vue:mounted="customDomain && ($refs.customDomainInput as VInput).validate()"
            validate-on="input"
            :rules="[
              d => (d ? true : 'Domain name is required.'),
              d => validators.isFQDN('Please provide a valid domain name.')(d)?.message || true,
            ]"
            @blur="($refs.customDomainInput as VInput).validate()"
          />
        </input-tooltip>
      </VExpandTransition>

      <VExpandTransition>
        <input-tooltip
          tooltip="Creates a subdomain for your instance on the selected domain to be able to access your instance from the browser."
          v-if="!disableSelectedDomain"
        >
          <VAutocomplete
            ref="domainInput"
            validate-on="input"
            label="Select domain"
            placeholder="Select a domain"
            :items="loadedDomains"
            :loading="domainsTask.loading"
            item-title="publicConfig.domain"
            v-model="selectedDomain"
            @vue:mounted="selectedDomain && ($refs.domainInput as VInput).validate()"
            :rules="[d => (d ? true : 'Domain is required.')]"
            @update:menu="opened => !opened && $nextTick().then(($refs.domainInput as VInput).validate)"
            @blur="$nextTick().then(($refs.domainInput as VInput).validate)"
            return-object
          >
            <template #append-item v-if="pagination.page !== -1">
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
      </VExpandTransition>

      <v-alert
        v-if="
          !disableSelectedDomain &&
          useFQDN &&
          modelValue &&
          modelValue.customDomain &&
          selectedDomain?.publicConfig?.ipv4
        "
        class="mb-4"
        type="warning"
        variant="tonal"
      >
        Before starting the deployment, Please make sure to create an A record on your name provider with
        <span class="font-weight-bold">{{ customDomain }}</span> pointing to
        <span class="font-weight-bold">{{ selectedDomain.publicConfig.ipv4.split("/")[0] }}</span>
      </v-alert>
    </VForm>
  </section>
</template>

<script lang="ts">
import type { FarmInfo, FilterOptions, NodeInfo } from "@threefold/grid_client";
import { computed, nextTick, onUnmounted, type PropType, ref, watch } from "vue";
import { onMounted } from "vue";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { VInput } from "vuetify/components/VInput";

import { useAsync, usePagination, useWatchDeep } from "../../hooks";
import { ValidatorStatus } from "../../hooks/form_validator";
import { useGrid } from "../../stores";
import type { DomainInfo, SelectionDetailsFilters } from "../../types/nodeSelector";
import { getNodePageCount, loadNodes } from "../../utils/nodeSelector";

export default {
  name: "TfDomainName",
  props: {
    modelValue: Object as PropType<DomainInfo>,
    filters: {
      type: Object as PropType<SelectionDetailsFilters>,
      required: true,
    },
    farm: Object as PropType<FarmInfo>,
    hideTitle: Boolean,
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
        pagination.value.next();
      },
      default: [],
    });

    const pageCountTask = useAsync(getNodePageCount, { default: 1 });
    const pagination = usePagination();

    const enableCustomDomain = ref(false);
    const filters = computed<FilterOptions>(() => ({
      gateway: true,
      size: window.env.PAGE_SIZE,
      page: Math.max(1, pagination.value.page),
      farmId: enableCustomDomain.value ? props.farm?.farmId : undefined,
      availableFor: gridStore.client.twinId,
    }));

    const reloadDomains = () => domainsTask.value.run(gridStore, filters.value);

    useWatchDeep(
      filters,
      async filters => {
        await pageCountTask.value.run(gridStore, filters);
        pagination.value.reset(pageCountTask.value.data as number);
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

    const disableSelectedDomain = computed(() => enableCustomDomain.value && props.filters.ipv4 === true);
    const useFQDN = computed(() => enableCustomDomain.value && props.filters.ipv4 === false);

    const domain = computed<DomainInfo>(() => {
      return {
        selectedDomain: disableSelectedDomain.value ? null : selectedDomain.value,
        enableSelectedDomain: !disableSelectedDomain.value,
        enabledCustomDomain: enableCustomDomain.value,
        customDomain: enableCustomDomain.value ? customDomain.value : "",
        useFQDN: useFQDN.value,
      };
    });

    useWatchDeep(domain, bindModelValue, { immediate: true, deep: true });

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
      pagination,

      domainNameValid,

      enableCustomDomain,
      customDomain,

      domainsTask,
      loadedDomains,
      selectedDomain,
      reloadDomains,

      disableSelectedDomain,
      useFQDN,
    };
  },
};
</script>
