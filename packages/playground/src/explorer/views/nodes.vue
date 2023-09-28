<template>
  <node-filters v-model="filterInputs" v-model:valid="isValidForm" @update:model-value="InputFiltersReset" />

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
                      <v-col cols="12" sm="6" md="6" lg="4">
                        <input-tooltip inline tooltip="Enable filtering the nodes that have Gateway supported only.">
                          <v-switch
                            color="primary"
                            inset
                            label="Gateways (Only)"
                            v-model="filterOptions.gateway"
                            hide-details
                          />
                        </input-tooltip>
                      </v-col>
                      <v-col cols="12" sm="6" md="6" lg="4">
                        <input-tooltip inline tooltip="Enable filtering the nodes that have GPU card supported only.">
                          <v-switch
                            color="primary"
                            inset
                            label="GPU Node (Only)"
                            v-model="filterOptions.gpu"
                            hide-details
                          />
                        </input-tooltip>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col cols="12" sm="12" md="12" lg="4">
                    <v-row
                      justify="start"
                      justify-md="start"
                      justify-sm="start"
                      justify-lg="end"
                      justify-xl="end"
                      justify-xxl="end"
                    >
                      <v-col cols="7">
                        <v-select
                          class="p-4"
                          v-model="filterOptions.status"
                          :items="nodeStatusOptions"
                          label="Select Nodes Status"
                          variant="underlined"
                        ></v-select>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </div>
              <div class="hint mb-2 mt-3">
                <v-alert type="info" variant="tonal">
                  The nodes will be filtered and displayed after 1 second once you remove your finger from the filters.
                </v-alert>
              </div>
              <nodes-table
                v-model="nodes"
                v-model:size="filterOptions.size"
                v-model:page="filterOptions.page"
                :count="nodesCount"
                :loading="tableLoading"
                v-model:selectedNode="selectedNode"
                @open-dialog="openDialog"
              />
            </div>
          </v-col>
        </v-row>
      </div>
    </div>
    <node-details :node="selectedNode" :openDialog="isDialogOpened" @close-dialog="closeDialog" />
  </view-layout>
</template>

<script lang="ts">
import { type GridNode, type NodesQuery, NodeStatus } from "@threefold/gridproxy_client";
import debounce from "lodash/debounce.js";
import { ref, watch } from "vue";
import { onMounted } from "vue";
import { useRoute } from "vue-router";

import NodeDetails from "@/explorer/components/node_details.vue";
import NodesTable from "@/explorer/components/nodes_table.vue";
import router from "@/router";
import { inputsInitializer } from "@/utils/filter_nodes";

import { getFilterValues, getNode, requestNodes } from "../utils/helpers";
import {
  type FilterInputs,
  type FilterOptions,
  type MixedFilter,
  nodeInitializer,
  optionsInitializer,
} from "../utils/types.js";

export default {
  components: {
    NodesTable,
    NodeDetails,
  },
  setup() {
    const filterInputs = ref<FilterInputs>(inputsInitializer);
    const filterOptions = ref<FilterOptions>(optionsInitializer);
    const mixedFilters = ref<MixedFilter>({ inputs: filterInputs.value, options: filterOptions.value });

    const tableLoading = ref(false);
    const nodes = ref<GridNode[]>([]);
    const nodesCount = ref<number>(0);
    const selectedNode = ref<GridNode>(nodeInitializer);
    const isDialogOpened = ref<boolean>(false);
    const isValidForm = ref<boolean>(false);

    const nodeStatusOptions = [NodeStatus.Up, NodeStatus.Standby, NodeStatus.Down];
    const route = useRoute();

    const _requestNodes = async (options: Partial<NodesQuery> = {}, loadFarm = false) => {
      try {
        tableLoading.value = true;
        const { count, data } = await requestNodes(options, loadFarm);
        nodes.value = data;
        if (count) {
          nodesCount.value = count;
        }
      } catch (err) {
        console.log(err);
      } finally {
        tableLoading.value = false;
      }
    };

    const request = debounce(_requestNodes, 1000);
    watch(
      mixedFilters,
      async () => {
        if (isValidForm.value) {
          const options = getFilterValues(mixedFilters.value);
          await request(options, true);
        }
      },
      { deep: true },
    );

    // The mixed filters should reset to the default value again..
    const InputFiltersReset = (nFltrNptsVal: FilterInputs) => {
      mixedFilters.value.inputs = nFltrNptsVal;
      mixedFilters.value.options.status = NodeStatus.Up;
      mixedFilters.value.options.gpu = undefined;
      mixedFilters.value.options.gateway = undefined;
      mixedFilters.value.options.page = 1;
      mixedFilters.value.options.size = 10;
    };

    const checkSelectedNode = async () => {
      if (route.query.nodeId) {
        const node: any = await getNode(+route.query.nodeId);
        node.total_resources = node.capacity.total_resources;
        node.used_resources = node.capacity.used_resources;
        selectedNode.value = node;
        isDialogOpened.value = true;
      }
    };

    const closeDialog = () => {
      if (route.query.nodeId) {
        router.replace(route.path);
      }
      isDialogOpened.value = false;
      selectedNode.value = nodeInitializer;
    };

    const openDialog = (item: { props: { title: GridNode } }) => {
      const node: GridNode = item.props.title;
      selectedNode.value = node;
      router.push({ path: route.path, query: { nodeId: selectedNode.value.nodeId } });
      isDialogOpened.value = true;
    };

    onMounted(async () => {
      await checkSelectedNode();
      const options = getFilterValues(mixedFilters.value);
      await _requestNodes(options, true);
    });

    return {
      tableLoading,

      nodes,
      nodesCount,
      selectedNode,
      nodeStatusOptions,

      filterInputs,
      filterOptions,
      isDialogOpened,
      isValidForm,

      openDialog,
      closeDialog,
      requestNodes,
      InputFiltersReset,
    };
  },
};
</script>
