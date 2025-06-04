<template>
  <section>
    <h6 v-if="!hideTitle" class="text-h5 mb-4 mt-2">Domain Name</h6>

    <input-tooltip tooltip="Use a custom domain" align-center>
      <div>
        <VSwitch v-model="enableCustomDomain" color="primary" inset label="Custom Domain" hide-details />
      </div>
    </input-tooltip>

    <div ref="input">
      <form-validator ref="domainFormRef">
        <VExpandTransition>
          <input-tooltip v-if="enableCustomDomain" tooltip="Domain name that will point to this instance">
            <InputValidator
              ref="customInputRef"
              v-model:value="customDomain"
              :rules="[
                validators.required('Domain name is required.'),
                validators.isFQDN('Please provide a valid domain name.'),
              ]"
              #="{ props }"
            >
              <VTextField
                v-bind="props"
                v-model="customDomain"
                label="Custom Domain"
                placeholder="Your custom domain"
              />
            </InputValidator>
          </input-tooltip>
        </VExpandTransition>

        <VExpandTransition>
          <input-tooltip
            v-if="!disableSelectedDomain"
            tooltip="Creates a subdomain for your instance on the selected domain to be able to access your instance from the browser."
          >
            <InputValidator
              ref="domainInput"
              #="{ props }"
              :rules="[validators.required('Domain is required.')]"
              :value="selectedDomain as INode"
            >
              <VAutocomplete
                v-bind="props"
                v-model="selectedDomain"
                validate-on="input"
                label="Select domain"
                placeholder="Select a domain"
                :items="loadedDomains"
                :loading="domainsTask.loading"
                item-title="publicConfig.domain"
                :error-messages="[
                  ...props?.errorMessages,
                  ...(domainsTask.error?.message ? [domainsTask.error.message] : []),
                ]"
                return-object
              >
                <template v-if="pagination.page !== -1" #append-item>
                  <VContainer>
                    <VBtn
                      block
                      color="secondary"
                      variant="tonal"
                      :loading="domainsTask.loading"
                      prepend-icon="mdi-reload"
                      @click="loadDomains"
                    >
                      Load More Domains
                    </VBtn>
                  </VContainer>
                </template>
                <template #append>
                  <v-slide-x-reverse-transition mode="out-in">
                    <v-icon icon="mdi-reload" @click="reloadDomains" />
                  </v-slide-x-reverse-transition>
                </template>
              </VAutocomplete>
            </InputValidator>
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
      </form-validator>
    </div>
  </section>
</template>

<script lang="ts">
import { type FarmInfo, Features, type FilterOptions, type NodeInfo } from "@threefold/grid_client";
import { noop } from "lodash";
import { computed, getCurrentInstance, nextTick, onMounted, onUnmounted, type PropType, ref, watch } from "vue";

import { type InputValidatorService, useInputRef } from "@/hooks/input_validator";

import { useAsync, usePagination } from "../../hooks";
import { useForm, useFormRef, ValidatorStatus } from "../../hooks/form_validator";
import { useWatchDeep } from "../../hooks/useWatchDeep";
import { useGrid } from "../../stores";
import type { DomainInfo, NetworkFeatures, SelectionDetailsFilters } from "../../types/nodeSelector";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { INode } from "../../utils/filter_nodes";
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
    useFqdn: Boolean,
    interfaces: {
      type: Array as PropType<NetworkFeatures[]>,
      required: false,
      default: () => [],
    },
  },
  emits: {
    "update:model-value": (domain?: DomainInfo) => true || domain,
    "update:status": (status: ValidatorStatus) => true || status,
  },
  setup(props, ctx) {
    const gridStore = useGrid();
    const input = ref<HTMLElement>();

    const loadedDomains = ref<NodeInfo[]>([]);
    const loadedPages = ref<Set<number>>(new Set());
    const domainsTask = useAsync(loadNodes, {
      onAfterTask({ data }) {
        const currentPage = pagination.value.page;
        if (!loadedPages.value.has(currentPage)) {
          loadedDomains.value = loadedDomains.value.concat(data as NodeInfo[]);
          loadedPages.value.add(currentPage);
        }
        pagination.value.next();
      },
      default: [],
    });
    const pageCountTask = useAsync(getNodePageCount, {
      default: 1,
      onAfterTask({ data }) {
        pagination.value.reset(data as number);
        loadedPages.value.clear();
      },
    });
    const pagination = usePagination();

    const enableCustomDomain = ref(false);
    const size = ref(window.env.PAGE_SIZE);
    const filters = computed<FilterOptions>(() => ({
      gateway: true,
      size: size.value,
      page: Math.max(1, pagination.value.page),
      farmId: enableCustomDomain.value ? props.farm?.farmId : undefined,
      availableFor: gridStore.client?.twinId,
      features: props.interfaces.filter(i => i != Features.ip),
      hasIPv6: props.interfaces.some(i => i === Features.ip) || undefined,
    }));
    const selectedDomain = ref<NodeInfo | null>(null);
    const loadDomains = () => {
      const currentPage = pagination.value.page;
      if (!loadedPages.value.has(currentPage)) {
        return domainsTask.value.run(gridStore, filters.value);
      }
    };

    const domainInput = useInputRef();
    const reloadDomains = async () => {
      domainInput.value?.reset();
      if (selectedDomain.value) {
        selectedDomain.value = null;
        bindModelValue();
      }
      loadedPages.value.clear();
      loadedDomains.value = [];
      await pageCountTask.value.run(gridStore, filters.value);
      await nextTick();
      return loadDomains();
    };

    useWatchDeep(
      () => ({
        farmId: props.farm?.farmId,
        twinId: gridStore.client?.twinId,
        interfaces: props.interfaces,
      }),
      (newVal, oldVal) => {
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          reloadDomains();
        }
      },
    );

    const customDomain = ref("");
    const domainFormRef = useFormRef();

    const disableSelectedDomain = computed(() => enableCustomDomain.value && props.filters.ipv4 === true);
    const useFQDN = computed(() => enableCustomDomain.value && (props.useFqdn || props.filters.ipv4 === false));

    const domain = computed<DomainInfo>(() => ({
      selectedDomain: disableSelectedDomain.value ? null : selectedDomain.value,
      enableSelectedDomain: !disableSelectedDomain.value,
      enabledCustomDomain: enableCustomDomain.value,
      customDomain: enableCustomDomain.value ? customDomain.value : "",
      useFQDN: useFQDN.value,
    }));

    watch(
      domain,
      newDomain => {
        bindModelValue(newDomain);
      },
      { immediate: true },
    );

    onUnmounted(() => {
      bindModelValue();
      bindStatus();
    });

    function bindModelValue(domain?: DomainInfo): void {
      ctx.emit("update:model-value", domain);
    }

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

    onMounted(() => {
      bindStatus();
      pageCountTask.value.run(gridStore, filters.value).then(() => {
        loadDomains();
      });
      form?.register(uid.toString(), fakeService);
    });
    onUnmounted(() => form?.unregister(uid.toString()));

    function bindStatus(status?: ValidatorStatus): void {
      const s = status || ValidatorStatus.Init;
      fakeService.status = s;
      form?.updateStatus(uid.toString(), s);
      ctx.emit("update:status", s);
    }

    const status = computed(() => {
      const _domain = domainFormRef?.value;
      if (!_domain) return ValidatorStatus.Init;

      switch (true) {
        case _domain.valid as unknown as boolean:
          return ValidatorStatus.Valid;
        case _domain.invalid as unknown as boolean:
          return ValidatorStatus.Invalid;
        case _domain.pending as unknown as boolean:
          return ValidatorStatus.Pending;
        default:
          return ValidatorStatus.Init;
      }
    });

    watch(status, () => bindStatus(status.value), { immediate: true });

    return {
      pagination,
      input,

      enableCustomDomain,
      customDomain,

      domainsTask,
      loadedDomains,
      selectedDomain,
      loadDomains,
      reloadDomains,
      size,

      domainFormRef,
      domainInput,
      disableSelectedDomain,
      useFQDN,
    };
  },
};
</script>
