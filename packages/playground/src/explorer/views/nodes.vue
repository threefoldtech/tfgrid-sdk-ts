<template>
  <node-filter v-model="filters" />

  <div class="hint mb-2 mt-3">
    <v-alert type="info" variant="tonal">
      Node statuses are updated every 90 minutes. For a realtime status, please click on the row.
    </v-alert>
  </div>

  <view-layout>
    <div class="nodes">
      <div class="nodes-inner">
        <v-row>
          <v-col cols="12">
            <div class="table">
              <div class="table-filters">
                <v-row>
                  <v-col>
                    <v-row>
                      <v-col>
                        <v-switch
                          v-model="gatewayFilter"
                          class="mt-0 ml-2"
                          label="Gateways (Only)"
                          @update:model-value="gatewayValueChange"
                          hide-details
                        />
                        <!-- @update:model-value="updateGpuAndGatewayFilter" -->
                      </v-col>
                      <v-col>
                        <v-switch class="mt-0 ml-2" v-model="gpuFilter" label="GPU Node (Only)" hide-details />
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col>
                    <v-row justify="end">
                      <v-col cols="7">
                        <v-select
                          class="p-0"
                          v-model="nodeStatusFilter"
                          :items="[statusFilters.Up, statusFilters.Down]"
                          label="Select Nodes Status"
                          variant="underlined"
                          @update:model-value="(val: any) => onUpdateOptions({status: val.toLowerCase() as any})"
                        ></v-select>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </div>

              <div class="table-content">
                <v-row>
                  <v-col>
                    <v-data-table-server
                      ref="table"
                      :loading="tableLoading"
                      loading-text="Loading..."
                      :headers="headers"
                      :items="nodes"
                      :items-length="(nodesCount as number)"
                      :items-per-page="nodesTablePageSize"
                      :items-per-page-options="[
                        { value: 5, title: '5' },
                        { value: 10, title: '10' },
                        { value: 15, title: '15' },
                        { value: 50, title: '50' },
                      ]"
                      :page.sync="nodesTablePageNumber"
                      class="elevation-1 v-data-table-header"
                      density="compact"
                      :disable-sort="true"
                      hide-default-header
                      :hover="true"
                      @click:row="openSheet"
                      @update:options="onUpdateOptions({ page: $event.page, size: $event.itemsPerPage })"
                    >
                      <template v-slot:headers="{ columns }: any">
                        <tr>
                          <template v-for="column in columns" :key="column.key">
                            <th>
                              <v-tooltip location="bottom">
                                <template v-slot:activator="{ props }">
                                  <span v-bind="props">{{ column.title }}</span>
                                </template>
                                <span>{{ column.description || column.title }}</span>
                              </v-tooltip>
                            </th>
                          </template>
                        </tr>
                      </template>

                      <template v-slot:[`item.total_resources.cru`]="{ item }">
                        {{ toFixedCsSize(item?.columns?.total_resources?.cru) }}
                      </template>

                      <template v-slot:[`item.total_resources.mru`]="{ item }">
                        {{ toFixedCsSize(item?.columns?.total_resources?.mru) }}
                      </template>

                      <template v-slot:[`item.total_resources.sru`]="{ item }">
                        {{ toFixedCsSize(item?.columns?.total_resources?.sru) }}
                      </template>

                      <template v-slot:[`item.total_resources.hru`]="{ item }">
                        {{ toFixedCsSize(item?.columns?.total_resources?.hru) }}
                      </template>

                      <template v-slot:[`item.uptime`]="{ item }">
                        {{ secondToRedable(item?.columns?.uptime) }}
                      </template>

                      <template v-slot:[`item.status`]="{ item }">
                        <p class="text-left mt-1 mb-0">
                          <v-chip :color="getStatus(item).color">
                            <span>
                              {{ getStatus(item).status }}
                            </span>
                          </v-chip>
                        </p>
                      </template>
                    </v-data-table-server>
                  </v-col>
                </v-row>
              </div>
            </div>
          </v-col>
        </v-row>
      </div>
    </div>
    <NodeDetails :openDetails="openDetails" :node="currentNode" @close-details="() => toggleNodeDetails(false)" />
  </view-layout>
</template>

<script lang="ts">
import { type NodesQuery, NodeStatus } from "tf_gridproxy_client";
import type { Ref } from "vue";
import { ref, watch } from "vue";
import { onMounted } from "vue";

import secondToRedable from "@/utils/second_to_redable";
import toFixedCsSize from "@/utils/to_fixed_cs_size";

import NodeFilter from "../components/Common/Filters/NodeFilter.vue";
import NodeDetails from "../components/Nodes/NodeDetails.vue";
import { requestNodes } from "../utils/helpers";
import { filterInitializer, type NodeFiltersType } from "../utils/types.js";

export default {
  components: {
    NodeFilter,
    NodeDetails,
  },
  setup() {
    const filters = ref<NodeFiltersType>(filterInitializer);

    // Switches Filter
    const gpuFilter = ref(false);
    const gatewayFilter = ref(false);

    const nodes: any = ref([]);
    const nodesCount: Ref<number | null> = ref(0);
    const nodeStatusFilter = ref<NodeStatus>(NodeStatus.Up);
    const statusFilters = NodeStatus;

    const tableLoading = ref(false);
    const nodesTablePageNumber = ref(1);
    const nodesTablePageSize = ref(10);

    const defaultFilterValues = ref({
      retCount: true,
      page: nodesTablePageNumber.value,
      size: nodesTablePageSize.value,
      status: nodeStatusFilter.value.toLowerCase() as any,
    });

    onMounted(async () => {
      _requestNodes(defaultFilterValues.value);
    });

    const _requestNodes = async (options?: Partial<NodesQuery>) => {
      try {
        tableLoading.value = true;
        const { count, data } = await requestNodes(options);
        nodes.value = data;
        nodesCount.value = count;
      } catch (err) {
        console.log(err);
      } finally {
        tableLoading.value = false;
      }
    };

    const gatewayValueChange = async () => {
      tableLoading.value = true;
      // if (gatewayFilter.value) {
      //   await getNodes({ ...defaultFilterValues.value, domain: gatewayFilter.value, ipv4: gatewayFilter.value });
      // } else {
      //   await getNodes({ ...defaultFilterValues.value });
      // }
      tableLoading.value = false;
    };

    // Watch on filter reset.
    watch(filters, async () => {
      console.log("filters 2 changed...");
      await _requestNodes();
    });

    watch(nodeStatusFilter, () => {
      filters.value.status = nodeStatusFilter.value;
      console.log("Status changed...");
    });

    // Watch on values, filters.
    watch(filters.value, async () => {
      console.log("filters changed...");
      await _requestNodes({
        nodeId: filters.value.nodeId.value ? +filters.value.nodeId.value : undefined,
        farmIds: filters.value.farmIds.value,
        farmName: filters.value.farmName.value,
        freeMru: filters.value.freeMru.value ? +filters.value.freeMru.value * 1024 * 1024 * 1024 : undefined,
        freeHru: filters.value.freeHru.value ? +filters.value.freeHru.value * 1024 * 1024 * 1024 : undefined,
        freeSru: filters.value.freeSru.value ? +filters.value.freeSru.value * 1024 * 1024 * 1024 : undefined,
        status: filters.value.status,
      });
    });

    const getStatus = (node: any) => {
      if (node.props.title.status === statusFilters.Up.toLocaleLowerCase()) {
        return { color: "green", status: statusFilters.Up };
      } else {
        return { color: "red", status: statusFilters.Down };
      }
    };
    // ______________

    const headers: any = [
      { title: "ID", key: "nodeId" },
      { title: "Farm ID", key: "farmId", align: "center" },
      {
        title: "Total Public IPs",
        key: "totalPublicIPs",
        align: "center",
      },
      { title: "Free Public IPs", key: "freePublicIPs", align: "center" },
      { title: "CRU", key: "total_resources.cru", align: "center", description: "Total Cores" },
      { title: "MRU", key: "total_resources.mru", align: "center", description: "Total Memory" },
      { title: "SRU", key: "total_resources.sru", align: "center", description: "Total SSD" },
      { title: "HRU", key: "total_resources.hru", align: "center", description: "Total HDD" },
      { title: "GPU", key: "num_gpu", align: "center", description: "GPU card" },
      { title: "Up Time", key: "uptime", align: "left" },
      { title: "Status", key: "status", align: "center" },
    ];

    // ______________

    // Nodes Handling

    const onUpdateOptions = (options: Partial<NodesQuery>) => {
      defaultFilterValues.value = {
        ...defaultFilterValues.value,
        ...options,
      };
      if (gatewayFilter.value) {
        requestNodes({ ...defaultFilterValues.value, domain: gatewayFilter.value, ipv4: gatewayFilter.value });
      } else {
        requestNodes(defaultFilterValues.value);
      }
    };
    // ______________

    // Node Details
    const openDetails = ref(false);
    const currentNode = ref({});

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const openSheet = (_e: any, { item }: any) => {
      console.log(item);

      currentNode.value = item.raw;
      toggleNodeDetails(true);
    };

    const toggleNodeDetails = (val: boolean) => {
      openDetails.value = val;
    };
    // ______________

    return {
      gpuFilter,
      gatewayFilter,
      gatewayValueChange,

      nodeStatusFilter,
      getStatus,
      nodesTablePageNumber,
      nodesTablePageSize,
      tableLoading,
      headers,

      nodes,
      nodesCount,
      defaultFilterValues,
      requestNodes,
      onUpdateOptions,

      secondToRedable,
      toFixedCsSize,

      openDetails,
      currentNode,
      toggleNodeDetails,
      openSheet,
      filters,
      statusFilters,
    };
  },
};
</script>

<style>
.v-data-table-header th,
.v-data-table-header td {
  white-space: nowrap;
}
</style>
