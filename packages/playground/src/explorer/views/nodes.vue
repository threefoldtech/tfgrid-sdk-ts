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
                          :items="[statusFilter.up, statusFilter.down]"
                          label="Select Nodes Status"
                          variant="underlined"
                          @update:model-value="(val:string) => onUpdateOptions({status: val.toLowerCase() as any})"
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
import type { NodesQuery } from "tf_gridproxy_client";
import type { Ref } from "vue";
import { ref, watch } from "vue";

import { gridProxyClient } from "@/clients";
import secondToRedable from "@/utils/second_to_redable";
import toFixedCsSize from "@/utils/to_fixed_cs_size";

import NodeFilter from "../components/Common/Filters/NodeFilter.vue";
import NodeDetails from "../components/Nodes/NodeDetails.vue";
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

    const gatewayValueChange = async () => {
      tableLoading.value = true;
      if (gatewayFilter.value) {
        await getNodes({ ...defaultFilterValues.value, domain: gatewayFilter.value, ipv4: gatewayFilter.value });
      } else {
        await getNodes({ ...defaultFilterValues.value });
      }
      tableLoading.value = false;
    };
    // ______________

    watch(filters.value, async () => {
      if (filters.value.nodeId.rules) {
        filters.value.nodeId.rules[0]("This is an message");
        console.log(filters.value.nodeId.rules[0]("This is an message").error);
      }
      try {
        const { count, data } = await gridProxyClient.nodes.list({
          retCount: true,
          nodeId: filters.value.nodeId.value ? +filters.value.nodeId.value : undefined,
          farmIds: filters.value.farmIds.value,
          farmName: filters.value.farmName.value,
          freeMru: filters.value.freeMru.value ? +filters.value.freeMru.value * 1024 * 1024 * 1024 : undefined,
          freeHru: filters.value.freeHru.value ? +filters.value.freeHru.value * 1024 * 1024 * 1024 : undefined,
          freeSru: filters.value.freeSru.value ? +filters.value.freeSru.value * 1024 * 1024 * 1024 : undefined,
        });
        nodes.value = data;
        nodesCount.value = count;
      } catch (err) {
        console.log(err);
      }
    });

    const setValue = async () => {
      try {
        const { count, data } = await gridProxyClient.nodes.list({
          retCount: true,
          nodeId: filters.value.nodeId.value ? +filters.value.nodeId.value : undefined,
          farmIds: filters.value.farmIds.value,
          farmName: filters.value.farmName.value,
          freeMru: filters.value.freeMru.value ? +filters.value.freeMru.value * 1024 * 1024 * 1024 : undefined,
          freeHru: filters.value.freeHru.value ? +filters.value.freeHru.value * 1024 * 1024 * 1024 : undefined,
          freeSru: filters.value.freeSru.value ? +filters.value.freeSru.value * 1024 * 1024 * 1024 : undefined,
        });
        nodes.value = data;
        nodesCount.value = count;
      } catch (err) {
        console.log(err);
      }

      // console.log("inputs", inputs);

      // const strKeys = ["farmIds", "country", "farmName"];
      // const convertedKeys = ["freeHru", "freeMru", "freeSru"];
      // const excludedKeys = ["twinId"];
      // if (!excludedKeys.includes(key)) {
      //   if (strKeys.includes(key)) {
      //     defaultFilterValues.value = { ...defaultFilterValues.value, [key]: value };
      //   } else {
      //     if (!convertedKeys.includes(key)) {
      //       defaultFilterValues.value = { ...defaultFilterValues.value, [key]: +value };
      //     } else {
      //       let newVal = +value * 1024 * 1024 * 1024;
      //       newVal = Math.ceil(newVal);
      //       defaultFilterValues.value = { ...defaultFilterValues.value, [key]: newVal };
      //     }
      //   }
      // }
      // requestNodes(defaultFilterValues.value);
    };
    // ______________
    // Status Filter
    const statusFilter = { up: "Up", down: "Down" };
    const nodeStatusFilter = ref<string>(statusFilter.up);

    const getStatus = (node: any) => {
      if (node.props.title.status === statusFilter.up.toLocaleLowerCase()) {
        return { color: "green", status: statusFilter.up };
      } else {
        return { color: "red", status: statusFilter.down };
      }
    };
    // ______________

    // Table Options
    const tableLoading = ref(false);
    const nodesTablePageNumber = ref(1);
    const nodesTablePageSize = ref(10);
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
    const nodes: any = ref([]);
    const nodesCount: Ref<number | null> = ref(0);
    const defaultFilterValues = ref({
      retCount: true,
      page: nodesTablePageNumber.value,
      size: nodesTablePageSize.value,
      status: nodeStatusFilter.value.toLowerCase() as any,
    });

    const getNodes = async (options: Partial<NodesQuery>) => {
      try {
        const { count, data } = await gridProxyClient.nodes.list(options);
        nodes.value = data;
        nodesCount.value = count;
      } catch (err) {
        console.log(err);
      }
    };

    const requestNodes = async (options: Partial<NodesQuery>) => {
      tableLoading.value = true;
      // for (const option in options) {
      //   if (options[option] === 0 || options[option] === "") {
      //     delete options[option];
      //   }
      // }
      await getNodes({});
      tableLoading.value = false;
    };

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
      // ______________
      // Status Filter
      statusFilter,
      nodeStatusFilter,
      getStatus,
      // ______________
      // Nodes Filters
      setValue,
      // ______________
      // Table Options
      nodesTablePageNumber,
      nodesTablePageSize,
      tableLoading,
      headers,
      // ______________
      // Nodes Handling
      nodes,
      nodesCount,
      defaultFilterValues,
      getNodes,
      requestNodes,
      onUpdateOptions,
      // ______________

      // utils
      secondToRedable,
      toFixedCsSize,
      // ______________

      // Node Details
      openDetails,
      currentNode,
      toggleNodeDetails,
      openSheet,
      filters,
    };
  },
  created() {
    this.requestNodes(this.defaultFilterValues);
  },
};
</script>

<style>
.v-data-table-header th,
.v-data-table-header td {
  white-space: nowrap;
}
</style>
