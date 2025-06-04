<template>
  <view-layout>
    <v-card color="primary" class="d-flex justify-center items-center pa-3 text-center">
      <v-icon size="30" class="pr-3"> mdi-access-point </v-icon>
      <v-card-title class="pa-0"> Node Finder </v-card-title>
    </v-card>
    <div class="hint mt-3">
      <v-alert class="mb-4" type="info" variant="tonal">
        Node status is updated every 90 minutes. For a realtime status, click on the node's card.
      </v-alert>
    </div>
    <TfFiltersLayout>
      <template #filters>
        <TfFiltersContainer class="mb-4" :loading="loading" @apply="loadNodes(true)">
          <TfFilter v-model="filters.dedicated" query-route="dedicated">
            <v-switch
              v-model="filters.dedicated"
              color="primary"
              inset
              label="Dedicated Nodes"
              density="compact"
              hide-details
            />
          </TfFilter>
          <TfFilter v-model="filters.gateway" query-route="gateway">
            <v-switch v-model="filters.gateway" color="primary" inset label="Gateways" density="compact" hide-details />
          </TfFilter>

          <TfFilter v-model="filters.gpu" query-route="gpu">
            <v-switch v-model="filters.gpu" color="primary" inset label="GPU Node" density="compact" hide-details />
          </TfFilter>

          <TfFilter v-if="profileManager.profile" v-model="filters.rentable" query-route="rentable">
            <v-switch
              v-model="filters.rentable"
              color="primary"
              inset
              label="Rentable"
              density="compact"
              hide-details
              @change="handleRentableChange()"
            />
          </TfFilter>

          <TfFilter v-model="filters.ipv6" query-route="ipv6">
            <v-switch v-model="filters.ipv6" color="primary" inset label="IPv6" density="compact" hide-details />
          </TfFilter>
          <TfFilter v-if="profileManager.profile" v-model="filters.myRentedNodes" query-route="myRentedNodes">
            <v-switch
              v-model="filters.myRentedNodes"
              color="primary"
              inset
              label="Rented By Me"
              density="compact"
              hide-details
            />
          </TfFilter>

          <VTooltip
            location="bottom"
            offset="-25"
            :disabled="!filters.rentable"
            text="The 'Rentable' filter will list only 'Standby & Up' nodes."
          >
            <template #activator="{ props }">
              <TfFilter v-bind="props" v-model="filters.status" class="mt-4" query-route="node-status">
                <v-select
                  :disabled="filters.rentable"
                  :model-value="filters.status || undefined"
                  :items="[
                    { title: 'Up', value: UnifiedNodeStatus.Up },
                    { title: 'Standby', value: UnifiedNodeStatus.Standby },
                    { title: 'Up or Standby', value: UnifiedNodeStatus.UpStandby },
                    { title: 'Down', value: UnifiedNodeStatus.Down },
                  ]"
                  label="Select Nodes Status"
                  item-title="title"
                  item-value="value"
                  variant="outlined"
                  clearable
                  density="compact"
                  @update:model-value="filters.status = $event || ''"
                  @click:clear="filters.status = ''"
                />
              </TfFilter>
            </template>
          </VTooltip>

          <TfFilter
            v-model="filters.nodeId"
            query-route="node-id"
            :rules="[
              validators.isNumeric('This field accepts numbers only.', { no_symbols: true }),
              validators.min('The node id should be larger than zero.', 1),
              validators.startsWith('The node id start with zero.', '0'),
              validators.validateResourceMaxNumber('This is not a valid ID.'),
            ]"
          >
            <template #input="{ props }">
              <VTextField v-model="filters.nodeId" label="Node ID" variant="outlined" density="compact" v-bind="props">
                <template #append-inner>
                  <VTooltip text="Filter by node id">
                    <template #activator="{ props: tooltipProps }">
                      <VIcon icon="mdi-information-outline" v-bind="tooltipProps" />
                    </template>
                  </VTooltip>
                </template>
              </VTextField>
            </template>
          </TfFilter>

          <TfFilter
            v-model="filters.farmId"
            query-route="farm-id"
            :rules="[
              validators.isNumeric('This field accepts numbers only.', {
                no_symbols: true,
              }),
              validators.min('The ID should be larger than zero.', 1),
              validators.isInt('should be an integer'),
              validators.validateResourceMaxNumber('This is not a valid ID.'),
            ]"
          >
            <template #input="{ props }">
              <VTextField v-model="filters.farmId" label="Farm ID" variant="outlined" density="compact" v-bind="props">
                <template #append-inner>
                  <VTooltip text="Filter by farm id">
                    <template #activator="{ props: tooltipProps }">
                      <VIcon icon="mdi-information-outline" v-bind="tooltipProps" />
                    </template>
                  </VTooltip>
                </template>
              </VTextField>
            </template>
          </TfFilter>

          <TfFilter v-model="filters.farmName" query-route="farm-name">
            <template #unwrap="{ colProps }">
              <VCol v-bind="colProps">
                <TfSelectFarm
                  inset-tooltip
                  variant="outlined"
                  tooltip="Filter by farm name."
                  :model-value="filters.farmName ? ({ name: filters.farmName } as any) : undefined"
                  density="compact"
                  @update:model-value="filters.farmName = $event?.name || ''"
                />
              </VCol>
            </template>
          </TfFilter>

          <TfSelectLocation
            :model-value="{ region: filters.region, country: filters.country }"
            :only-with-nodes="false"
            @update:model-value="
              filters.country = $event?.country || '';
              filters.region = $event?.region || '';
            "
          >
            <template #region="{ props }">
              <TfFilter v-model="filters.region" query-route="region">
                <TfSelectRegion :region-props="props" variant="outlined" density="compact" />
              </TfFilter>
            </template>

            <template #country="{ props }">
              <TfFilter v-model="filters.country" query-route="country">
                <TfSelectCountry :country-props="props" variant="outlined" density="compact" />
              </TfFilter>
            </template>
          </TfSelectLocation>

          <TfFilter
            v-model="filters.publicIPs"
            query-route="free-public-ips"
            :rules="[
              validators.isNumeric('This field accepts numbers only.', {
                no_symbols: true,
              }),
              validators.min('The node id should be larger then zero.', 1),
              validators.startsWith('The node id start with zero.', '0'),
              validators.validateResourceMaxNumber('This value is out of range.'),
            ]"
          >
            <template #input="{ props }">
              <VTextField
                v-model="filters.publicIPs"
                label="Free Public IPs"
                variant="outlined"
                density="compact"
                v-bind="props"
              >
                <template #append-inner>
                  <VTooltip text="Filter by free Public IPs">
                    <template #activator="{ props: tooltipProps }">
                      <VIcon icon="mdi-information-outline" v-bind="tooltipProps" />
                    </template>
                  </VTooltip>
                </template>
              </VTextField>
            </template>
          </TfFilter>

          <TfFilter
            v-model="filters.freeSSD"
            query-route="free-ssd"
            :rules="[
              validators.isNumeric('This field accepts numbers only.'),
              validators.min('The free ssd should be larger than zero.', 1),
              validators.validateResourceMaxNumber('This value is out of range.'),
            ]"
          >
            <template #input="{ props }">
              <VTextField
                v-model="filters.freeSSD"
                label="Free SSD (GB)"
                variant="outlined"
                density="compact"
                v-bind="props"
              >
                <template #append-inner>
                  <VTooltip text="Filter by the minimum available amount of SSD in the node.">
                    <template #activator="{ props: tooltipProps }">
                      <VIcon icon="mdi-information-outline" v-bind="tooltipProps" />
                    </template>
                  </VTooltip>
                </template>
              </VTextField>
            </template>
          </TfFilter>

          <TfFilter
            v-model="filters.freeHDD"
            query-route="free-hdd"
            :rules="[
              validators.isNumeric('This field accepts numbers only.'),
              validators.min('The free hdd should be larger than zero.', 1),
              validators.validateResourceMaxNumber('This value is out of range.'),
            ]"
          >
            <template #input="{ props }">
              <VTextField
                v-model="filters.freeHDD"
                label="Free HDD (GB)"
                variant="outlined"
                density="compact"
                v-bind="props"
              >
                <template #append-inner>
                  <VTooltip text="Filter by the minimum available amount of HDD in the node.">
                    <template #activator="{ props: tooltipProps }">
                      <VIcon icon="mdi-information-outline" v-bind="tooltipProps" />
                    </template>
                  </VTooltip>
                </template>
              </VTextField>
            </template>
          </TfFilter>

          <TfFilter
            v-model="filters.freeRAM"
            query-route="free-ram"
            :rules="[
              validators.isNumeric('This field accepts numbers only.'),
              validators.min('The free ram should be larger than zero.', 1),
              validators.validateResourceMaxNumber('This value is out of range.'),
            ]"
          >
            <template #input="{ props }">
              <VTextField
                v-model="filters.freeRAM"
                label="Free RAM (GB)"
                variant="outlined"
                density="compact"
                v-bind="props"
              >
                <template #append-inner>
                  <VTooltip text="Filter by the minimum available amount of RAM in the node.">
                    <template #activator="{ props: tooltipProps }">
                      <VIcon icon="mdi-information-outline" v-bind="tooltipProps" />
                    </template>
                  </VTooltip>
                </template>
              </VTextField>
            </template>
          </TfFilter>

          <TfFilter
            v-model="filters.numGpu"
            query-route="num-gpu"
            :rules="[
              validators.isNumeric('This field accepts numbers only.'),
              validators.min('The number of gpus should be larger than zero.', 1),
              validators.validateResourceMaxNumber('This value is out of range.'),
            ]"
          >
            <template #input="{ props }">
              <VTextField v-model="filters.numGpu" density="compact" label="Num GPU" variant="outlined" v-bind="props">
                <template #append-inner>
                  <VTooltip text="Filter by the number of gpus in the node.">
                    <template #activator="{ props: tooltipProps }">
                      <VIcon icon="mdi-information-outline" v-bind="tooltipProps" />
                    </template>
                  </VTooltip>
                </template>
              </VTextField>
            </template>
          </TfFilter>

          <TfFilter
            v-model="filters.minSSD"
            query-route="min-ssd"
            :rules="[
              validators.isNumeric('This field accepts numbers only.'),
              validators.min('The total ssd should be larger than zero.', 1),
              validators.validateResourceMaxNumber('This value is out of range.'),
            ]"
          >
            <template #input="{ props }">
              <VTextField
                v-model="filters.minSSD"
                label="Min SSD (GB)"
                variant="outlined"
                density="compact"
                v-bind="props"
              >
                <template #append-inner>
                  <VTooltip text="Filter by the minimum total amount of SSD in the node.">
                    <template #activator="{ props: tooltipProps }">
                      <VIcon icon="mdi-information-outline" v-bind="tooltipProps" />
                    </template>
                  </VTooltip>
                </template>
              </VTextField>
            </template>
          </TfFilter>

          <TfFilter
            v-model="filters.minHDD"
            query-route="min-hdd"
            :rules="[
              validators.isNumeric('This field accepts numbers only.'),
              validators.min('The total hdd should be larger than zero.', 1),
              validators.validateResourceMaxNumber('This value is out of range.'),
            ]"
          >
            <template #input="{ props }">
              <VTextField
                v-model="filters.minHDD"
                label="Min HDD (GB)"
                variant="outlined"
                density="compact"
                v-bind="props"
              >
                <template #append-inner>
                  <VTooltip text="Filter by the minimum total amount of HDD in the node.">
                    <template #activator="{ props: tooltipProps }">
                      <VIcon icon="mdi-information-outline" v-bind="tooltipProps" />
                    </template>
                  </VTooltip>
                </template>
              </VTextField>
            </template>
          </TfFilter>

          <TfFilter
            v-model="filters.minRAM"
            query-route="min-ram"
            :rules="[
              validators.isNumeric('This field accepts numbers only.'),
              validators.min('The total ram should be larger than zero.', 1),
              validators.validateResourceMaxNumber('This value is out of range.'),
            ]"
          >
            <template #input="{ props }">
              <VTextField
                v-model="filters.minRAM"
                label="Min RAM (GB)"
                variant="outlined"
                density="compact"
                v-bind="props"
              >
                <template #append-inner>
                  <VTooltip text="Filter by the minimum total amount of RAM in the node.">
                    <template #activator="{ props: tooltipProps }">
                      <VIcon icon="mdi-information-outline" v-bind="tooltipProps" />
                    </template>
                  </VTooltip>
                </template>
              </VTextField>
            </template>
          </TfFilter>

          <TfFilter
            v-model="filters.minCRU"
            query-route="min-cpu"
            :rules="[
              validators.isNumeric('This field accepts numbers only.'),
              validators.min('The total number of CPUs should be larger then zero.', 1),
              validators.validateResourceMaxNumber('This value is out of range.'),
            ]"
          >
            <template #input="{ props }">
              <VTextField
                v-model="filters.minCRU"
                label="Min CPU (vCores)"
                variant="outlined"
                density="compact"
                v-bind="props"
              >
                <template #append-inner>
                  <VTooltip text="Filter by the minimum total number of CPUs in the node.">
                    <template #activator="{ props: tooltipProps }">
                      <VIcon icon="mdi-information-outline" v-bind="tooltipProps" />
                    </template>
                  </VTooltip>
                </template>
              </VTextField>
            </template>
          </TfFilter>
        </TfFiltersContainer>
      </template>

      <v-row>
        <v-spacer />
        <v-col :style="{ maxWidth: '350px' }">
          <v-select v-model="sortItem" hide-details label="Sort By" clearable :items="sortItems" return-object>
            <template #item="{ props, item }">
              <v-list-item v-bind="props" :title="item.title" :prepend-icon="item.raw.icon" />
            </template>
          </v-select>
        </v-col>
      </v-row>

      <div class="nodes">
        <div class="nodes-inner">
          <v-row>
            <v-col cols="12">
              <div class="table">
                <VAlert v-if="error" type="error" class="text-body-1 mb-4">
                  Failed to load Nodes. Please try again!
                  <template #append>
                    <VBtn icon="mdi-reload" color="error" variant="plain" density="compact" @click="loadNodes(true)" />
                  </template>
                </VAlert>
                <nodes-table
                  v-model="nodes"
                  v-model:selected-node="selectedNodeId"
                  max-height="730px"
                  :size="size"
                  :page="page"
                  :count="nodesCount"
                  :loading="loading"
                  @update:size="
                    size = $event;
                    loadNodes();
                  "
                  @update:page="
                    page = $event;
                    loadNodes();
                  "
                  @open-dialog="openDialog"
                />
              </div>
            </v-col>
          </v-row>
        </div>
      </div>

      <node-details
        :filter-options="{ size, page, gpu: filters.gpu }"
        :node-id="selectedNodeId"
        :open-dialog="isDialogOpened"
        @close-dialog="closeDialog"
      />
    </TfFiltersLayout>
  </view-layout>
</template>

<script lang="ts">
import { type GridNode, SortBy, SortOrder, UnifiedNodeStatus } from "@threefold/gridproxy_client";
import { sortBy } from "lodash";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

import NodeDetails from "@/components/node_details.vue";
import NodesTable from "@/components/nodes_table.vue";
import router from "@/router";
import { useProfileManager } from "@/stores";
import { requestNodes } from "@/utils/get_nodes";
import { convertToBytes } from "@/utils/get_nodes";

import TfFilter from "../components/filters/TfFilter.vue";
import TfFiltersContainer from "../components/filters/TfFiltersContainer.vue";
import TfFiltersLayout from "../components/filters/TfFiltersLayout.vue";
import TfSelectFarm from "../components/node_selector/TfSelectFarm.vue";
import TfSelectLocation from "../components/node_selector/TfSelectLocation.vue";

const sortItems = [
  {
    icon: "mdi-sort-ascending",
    title: "USD Price: Low to High",
    value: (nodes: GridNode[]) => sortBy(nodes, "price_usd"),
  },
  {
    icon: "mdi-sort-descending",
    title: "USD Price: High to Low",
    value: (nodes: GridNode[]) => sortBy(nodes, "price_usd").reverse(),
  },
];

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Nodes",
  components: {
    NodesTable,
    NodeDetails,
    TfFiltersContainer,
    TfFilter,
    TfSelectFarm,
    TfSelectLocation,
    TfFiltersLayout,
  },
  setup() {
    const profileManager = useProfileManager();
    const size = ref(window.env.PAGE_SIZE);
    const error = ref(false);
    const page = ref(1);
    const filters = ref({
      nodeId: "",
      farmId: "",
      farmName: "",
      minSSD: "",
      minHDD: "",
      minRAM: "",
      minCRU: "",
      freeSSD: "",
      freeHDD: "",
      freeRAM: "",
      region: "",
      country: "",
      status: "",
      gateway: false,
      gpu: false,
      publicIPs: "",
      dedicated: false,
      numGpu: "",
      rentable: false,
      ipv6: false,
      myRentedNodes: false,
    });
    const oldNodeStatus = ref();
    watch(
      () => filters.value.rentable,
      rentable => {
        if (rentable) {
          oldNodeStatus.value = filters.value.status;
          filters.value.status = UnifiedNodeStatus.UpStandby;
        } else {
          filters.value.status = oldNodeStatus.value;
        }
      },
    );

    const nodeStatus = computed(() => {
      if (filters.value.rentable) {
        return UnifiedNodeStatus.UpStandby;
      } else {
        return oldNodeStatus.value;
      }
    });

    const handleRentableChange = () => {
      filters.value.status = nodeStatus.value;
    };
    const loading = ref<boolean>(true);
    const _nodes = ref<GridNode[]>([]);

    const sortItem = ref<{ title: string; icon: string; value: (nodes: GridNode[]) => GridNode[] }>();
    const nodes = computed(() => (sortItem.value?.value || ((x: GridNode[]) => x))(_nodes.value));

    const nodesCount = ref<number>(0);
    const selectedNodeId = ref<number>(0);

    const isDialogOpened = ref<boolean>(false);

    const route = useRoute();
    const rentableOrRentedBy = computed(() => filters.value.rentable && filters.value.myRentedNodes);
    async function loadNodes(retCount = false) {
      _nodes.value = [];
      loading.value = true;
      error.value = false;
      if (retCount) page.value = 1;
      try {
        const { count, data } = await requestNodes(
          {
            page: page.value,
            size: size.value,
            retCount,
            nodeId: +filters.value.nodeId || undefined,
            farmIds: filters.value.farmId || undefined,
            farmName: filters.value.farmName || undefined,
            country: filters.value.country,
            region: filters.value.region,
            status: (filters.value.status as UnifiedNodeStatus) || undefined,
            freeHru: convertToBytes(filters.value.freeHDD),
            freeMru: convertToBytes(filters.value.freeRAM),
            freeSru: convertToBytes(filters.value.freeSSD),
            totalHru: convertToBytes(filters.value.minHDD),
            totalMru: convertToBytes(filters.value.minRAM),
            totalSru: convertToBytes(filters.value.minSSD),
            totalCru: +filters.value.minCRU || undefined,
            hasGpu: filters.value.gpu || undefined,
            domain: filters.value.gateway || undefined,
            ipv4: filters.value.gateway || undefined,
            freeIps: +filters.value.publicIPs || undefined,
            dedicated: filters.value.dedicated || undefined,
            sortBy: SortBy.Status,
            sortOrder: SortOrder.Asc,
            numGpu: +filters.value.numGpu || undefined,
            rentable: filters.value.rentable && !rentableOrRentedBy.value ? filters.value.rentable : undefined,
            hasIPv6: filters.value.ipv6 ? filters.value.ipv6 : undefined,
            rentableOrRentedBy: rentableOrRentedBy.value ? profileManager.profile?.twinId : undefined,
            rentedBy:
              filters.value.myRentedNodes && profileManager.profile && !rentableOrRentedBy.value
                ? profileManager.profile.twinId
                : undefined,
          },
          { loadFarm: true },
        );

        _nodes.value = data;
        if (retCount) nodesCount.value = count ?? 0;
      } catch (err) {
        console.log(err);
        error.value = true;
      } finally {
        loading.value = false;
      }
    }

    const checkSelectedNode = async () => {
      if (route.query.nodeId) {
        selectedNodeId.value = +route.query.nodeId;
        isDialogOpened.value = true;
      }
    };

    onMounted(checkSelectedNode);

    const closeDialog = () => {
      if (route.query.nodeId) {
        const query = { ...router.currentRoute.value.query };
        delete query.nodeId;
        router.replace({ query });
      }
      isDialogOpened.value = false;
      selectedNodeId.value = 0;
    };

    const openDialog = async (item: GridNode) => {
      selectedNodeId.value = item.nodeId;
      isDialogOpened.value = true;
    };

    return {
      profileManager,
      loading,
      sortItems,
      sortItem,
      nodesCount,
      nodes,
      selectedNodeId,
      openDialog,
      closeDialog,
      requestNodes,
      isDialogOpened,
      filters,
      UnifiedNodeStatus,
      size,
      page,
      error,
      loadNodes,
      handleRentableChange,
    };
  },
};
</script>

<style lang="scss">
@media (max-width: 1350px) {
  .tf-node-card {
    .v-card-item {
      grid-template-areas:
        "prepend content"
        "append append";

      .v-card-item__append {
        display: flex;
        padding-inline-start: 0;
        padding: 1rem 0;

        > .d-flex {
          flex-direction: row-reverse;
        }
      }
    }

    .tf-node-resource {
      flex-basis: 100%;
    }
  }
}

@media (max-width: 850px) {
  .tf-layout-container {
    display: block !important;

    > div {
      width: 100% !important;
      margin: 0 !important;
    }

    .tf-filter-item {
      flex-basis: calc(50% - 16px);
    }

    .tf-filter-item:nth-of-type(2n) {
      margin-left: 32px;
    }
  }
}

@media (max-width: 600px) {
  .tf-layout-container {
    .tf-filter-item {
      flex-basis: 100%;
    }

    .tf-filter-item {
      margin-left: 0 !important;
    }
  }
}
</style>
