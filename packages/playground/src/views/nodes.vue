<template>
  <div class="hint">
    <v-alert type="info" variant="tonal">
      Node status is updated every 90 minutes. For a realtime status, click on the row.
    </v-alert>
  </div>

  <view-layout>
    <TfFiltersContainer class="mb-4" @apply="loadNodes" :loading="loading">
      <TfFilter
        query-route="node-id"
        :rules="[
          validators.isNumeric('This field accepts numbers only.', { no_symbols: true }),
          validators.min('The node id should be larger then zero.', 1),
          validators.startsWith('The node id start with zero.', '0'),
          validators.validateResourceMaxNumber('This is not a valid ID.'),
        ]"
        v-model="filters.nodeId"
      >
        <template #input="{ props }">
          <VTextField label="Node ID" variant="outlined" v-model="filters.nodeId" v-bind="props">
            <template #append-inner>
              <VTooltip text="Filter by node id">
                <template #activator="{ props }">
                  <VIcon icon="mdi-information-outline" v-bind="props" />
                </template>
              </VTooltip>
            </template>
          </VTextField>
        </template>
      </TfFilter>

      <TfFilter
        query-route="farm-id"
        v-model="filters.farmId"
        :rules="[
          validators.isNumeric('This field accepts numbers only.', { no_symbols: true }),
          validators.min('The ID should be larger than zero.', 1),
          validators.isInt('should be an integer'),
          validators.validateResourceMaxNumber('This is not a valid ID.'),
        ]"
      >
        <template #input="{ props }">
          <VTextField label="Farm ID" variant="outlined" v-model="filters.farmId" v-bind="props">
            <template #append-inner>
              <VTooltip text="Filter by farm id">
                <template #activator="{ props }">
                  <VIcon icon="mdi-information-outline" v-bind="props" />
                </template>
              </VTooltip>
            </template>
          </VTextField>
        </template>
      </TfFilter>

      <TfFilter query-route="farm-name" v-model="filters.farmName">
        <template #unwrap="{ colProps }">
          <VCol v-bind="colProps">
            <TfSelectFarm
              inset-tooltip
              variant="outlined"
              tooltip="Filter by farm name."
              :model-value="filters.farmName ? ({ name: filters.farmName } as any) : undefined"
              @update:model-value="filters.farmName = $event?.name || ''"
            />
          </VCol>
        </template>
      </TfFilter>

      <TfSelectLocation
        :model-value="{ region: filters.region, country: filters.country }"
        @update:model-value="
          filters.country = $event?.country || '';
          filters.region = $event?.region || '';
        "
      >
        <template #region="{ props }">
          <TfFilter query-route="region" v-model="filters.region">
            <TfSelectRegion :region-props="props" variant="outlined" />
          </TfFilter>
        </template>

        <template #country="{ props }">
          <TfFilter query-route="country" v-model="filters.country">
            <TfSelectCountry :country-props="props" variant="outlined" />
          </TfFilter>
        </template>
      </TfSelectLocation>

      <TfFilter
        query-route="min-ssd"
        v-model="filters.minSSD"
        :rules="[
          validators.isNumeric('This field accepts numbers only.'),
          validators.min('The total ssd should be larger then zero.', 1),
          validators.validateResourceMaxNumber('This value is out of range.'),
        ]"
      >
        <template #input="{ props }">
          <VTextField label="Min SSD (GB)" variant="outlined" v-model="filters.minSSD" v-bind="props">
            <template #append-inner>
              <VTooltip text="Filter by the minimum total amount of SSD in the node.">
                <template #activator="{ props }">
                  <VIcon icon="mdi-information-outline" v-bind="props" />
                </template>
              </VTooltip>
            </template>
          </VTextField>
        </template>
      </TfFilter>

      <TfFilter
        query-route="min-hdd"
        v-model="filters.minHDD"
        :rules="[
          validators.isNumeric('This field accepts numbers only.'),
          validators.min('The total hdd should be larger then zero.', 1),
          validators.validateResourceMaxNumber('This value is out of range.'),
        ]"
      >
        <template #input="{ props }">
          <VTextField label="Min HDD (GB)" variant="outlined" v-model="filters.minHDD" v-bind="props">
            <template #append-inner>
              <VTooltip text="Filter by the minimum total amount of HDD in the node.">
                <template #activator="{ props }">
                  <VIcon icon="mdi-information-outline" v-bind="props" />
                </template>
              </VTooltip>
            </template>
          </VTextField>
        </template>
      </TfFilter>

      <TfFilter
        query-route="min-ram"
        v-model="filters.minRAM"
        :rules="[
          validators.isNumeric('This field accepts numbers only.'),
          validators.min('The total ram should be larger then zero.', 1),
          validators.validateResourceMaxNumber('This value is out of range.'),
        ]"
      >
        <template #input="{ props }">
          <VTextField label="Min RAM (GB)" variant="outlined" v-model="filters.minRAM" v-bind="props">
            <template #append-inner>
              <VTooltip text="Filter by the minimum total amount of RAM in the node.">
                <template #activator="{ props }">
                  <VIcon icon="mdi-information-outline" v-bind="props" />
                </template>
              </VTooltip>
            </template>
          </VTextField>
        </template>
      </TfFilter>

      <TfFilter
        query-route="min-cpu"
        v-model="filters.minCRU"
        :rules="[
          validators.isNumeric('This field accepts numbers only.'),
          validators.min('The total number of CPUs should be larger then zero.', 1),
          validators.validateResourceMaxNumber('This value is out of range.'),
        ]"
      >
        <template #input="{ props }">
          <VTextField label="Min CPU " variant="outlined" v-model="filters.minCRU" v-bind="props">
            <template #append-inner>
              <VTooltip text="Filter by the minimum total number of CPUs in the node.">
                <template #activator="{ props }">
                  <VIcon icon="mdi-information-outline" v-bind="props" />
                </template>
              </VTooltip>
            </template>
          </VTextField>
        </template>
      </TfFilter>

      <TfFilter
        query-route="free-ssd"
        v-model="filters.freeSSD"
        :rules="[
          validators.isNumeric('This field accepts numbers only.'),
          validators.min('The free ssd should be larger then zero.', 1),
          validators.validateResourceMaxNumber('This value is out of range.'),
        ]"
      >
        <template #input="{ props }">
          <VTextField label="Free SSD (GB)" variant="outlined" v-model="filters.freeSSD" v-bind="props">
            <template #append-inner>
              <VTooltip text="Filter by the minimum available amount of SSD in the node.">
                <template #activator="{ props }">
                  <VIcon icon="mdi-information-outline" v-bind="props" />
                </template>
              </VTooltip>
            </template>
          </VTextField>
        </template>
      </TfFilter>

      <TfFilter
        query-route="free-hdd"
        v-model="filters.freeHDD"
        :rules="[
          validators.isNumeric('This field accepts numbers only.'),
          validators.min('The free hdd should be larger then zero.', 1),
          validators.validateResourceMaxNumber('This value is out of range.'),
        ]"
      >
        <template #input="{ props }">
          <VTextField label="Free HDD (GB)" variant="outlined" v-model="filters.freeHDD" v-bind="props">
            <template #append-inner>
              <VTooltip text="Filter by the minimum available amount of HDD in the node.">
                <template #activator="{ props }">
                  <VIcon icon="mdi-information-outline" v-bind="props" />
                </template>
              </VTooltip>
            </template>
          </VTextField>
        </template>
      </TfFilter>

      <TfFilter
        query-route="free-ram"
        v-model="filters.freeRAM"
        :rules="[
          validators.isNumeric('This field accepts numbers only.'),
          validators.min('The free ram should be larger then zero.', 1),
          validators.validateResourceMaxNumber('This value is out of range.'),
        ]"
      >
        <template #input="{ props }">
          <VTextField label="Free RAM (GB)" variant="outlined" v-model="filters.freeRAM" v-bind="props">
            <template #append-inner>
              <VTooltip text="Filter by the minimum available amount of RAM in the node.">
                <template #activator="{ props }">
                  <VIcon icon="mdi-information-outline" v-bind="props" />
                </template>
              </VTooltip>
            </template>
          </VTextField>
        </template>
      </TfFilter>

      <TfFilter query-route="node-status" v-model="filters.status">
        <v-select
          :model-value="filters.status || undefined"
          @update:model-value="filters.status = $event || ''"
          :items="[
            { title: 'Up', value: NodeStatus.Up },
            { title: 'Down', value: NodeStatus.Down },
            { title: 'Standby', value: NodeStatus.Standby },
          ]"
          label="Select Nodes Status"
          item-title="title"
          item-value="value"
          variant="outlined"
          clearable
          @click:clear="filters.status = ''"
        />
      </TfFilter>

      <TfFilter query-route="gateway" v-model="filters.gateway">
        <v-switch color="primary" inset label="Gateways (Only)" v-model="filters.gateway" hide-details />
      </TfFilter>

      <TfFilter query-route="gpu" v-model="filters.gpu">
        <v-switch color="primary" inset label="GPU Node (Only)" v-model="filters.gpu" hide-details />
      </TfFilter>
    </TfFiltersContainer>

    <div class="nodes mt-5">
      <div class="nodes-inner">
        <v-row>
          <v-col cols="12">
            <div class="table">
              <nodes-table
                v-model="nodes"
                :size="size"
                @update:size="
                  size = $event;
                  loadNodes();
                "
                :page="page"
                @update:page="
                  page = $event;
                  loadNodes();
                "
                :count="nodesCount"
                :loading="loading"
                v-model:selectedNode="selectedNodeId"
                @open-dialog="openDialog"
              />
            </div>
          </v-col>
        </v-row>
      </div>
    </div>
    <div class="mx-auto mt-5 d-flex">
      <div class="mr-6">
        <v-chip color="success" class="mr-2">
          <span class="text-subtitle-2"> Shared </span>
        </v-chip>
        <span class="text-subtitle-2">Multiple users can deploy on that node</span>
      </div>

      <div class="mr-6">
        <v-chip color="warning" class="mr-2">
          <span class="text-subtitle-2"> Rented </span>
        </v-chip>
        <span class="text-subtitle-2">Rented as full node for a single user</span>
      </div>

      <div class="mr-6">
        <v-chip color="primary" class="mr-2">
          <span class="text-subtitle-2"> Rentable </span>
        </v-chip>
        <span class="text-subtitle-2">You can rent it exclusively for your workloads</span>
      </div>
    </div>

    <node-details
      :filter-options="{ size, page, gpu: filters.gpu }"
      :nodeId="selectedNodeId"
      :openDialog="isDialogOpened"
      @close-dialog="closeDialog"
    />
  </view-layout>
</template>

<script lang="ts">
import { type GridNode, NodeStatus } from "@threefold/gridproxy_client";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import NodeDetails from "@/components/node_details.vue";
import NodesTable from "@/components/nodes_table.vue";
import router from "@/router";
import { requestNodes } from "@/utils/get_nodes";
import { convertToBytes } from "@/utils/get_nodes";

import TfFilter from "../components/filters/TfFilter.vue";
import TfFiltersContainer from "../components/filters/TfFiltersContainer.vue";
import TfSelectFarm from "../components/node_selector/TfSelectFarm.vue";
import TfSelectLocation from "../components/node_selector/TfSelectLocation.vue";

export default {
  components: {
    NodesTable,
    NodeDetails,
    TfFiltersContainer,
    TfFilter,
    TfSelectFarm,
    TfSelectLocation,
  },
  setup() {
    const size = ref(window.env.PAGE_SIZE);
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
    });

    const loading = ref<boolean>(true);
    const nodes = ref<GridNode[]>([]);
    const nodesCount = ref<number>(0);
    const selectedNodeId = ref<number>(0);

    const isDialogOpened = ref<boolean>(false);

    const route = useRoute();

    async function loadNodes() {
      loading.value = true;
      try {
        const { count, data } = await requestNodes(
          {
            page: page.value,
            size: size.value,
            retCount: true,
            nodeId: +filters.value.nodeId || undefined,
            farmIds: filters.value.farmId || undefined,
            farmName: filters.value.farmName || undefined,
            country: filters.value.country,
            region: filters.value.region,
            status: (filters.value.status as NodeStatus) || undefined,
            freeHru: convertToBytes(filters.value.freeHDD),
            freeMru: convertToBytes(filters.value.freeRAM),
            freeSru: convertToBytes(filters.value.freeSSD),
            totalHru: convertToBytes(filters.value.minHDD),
            totalMru: convertToBytes(filters.value.minRAM),
            totalSru: convertToBytes(filters.value.minSSD),
            totalCru: +filters.value.minCRU || undefined,
            hasGpu: filters.value.gpu || undefined,
            domain: filters.value.gateway || undefined,
          },
          { loadFarm: true },
        );
        nodes.value = data;
        nodesCount.value = count ?? 0;
      } catch (err) {
        console.log(err);
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

    const openDialog = async (item: { props: { title: GridNode } }) => {
      selectedNodeId.value = item.props.title.nodeId;
      isDialogOpened.value = true;
    };

    return {
      loading,
      nodesCount,
      nodes,
      selectedNodeId,
      openDialog,
      closeDialog,
      requestNodes,
      isDialogOpened,

      filters,
      NodeStatus,
      size,
      page,
      loadNodes,
    };
  },
};
</script>
