<template>
  <node-filter v-model="filterInputs" @update:model-value="InputFiltersReset" />

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
                      <v-col cols="4">
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
                      <v-col cols="4">
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
                  <v-col>
                    <v-row justify="end">
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
              <node-table
                v-model="nodes"
                v-model:size="filterOptions.size"
                v-model:page="filterOptions.page"
                :count="nodesCount"
                :loading="tableLoading"
                v-model:selectedNode="selectedNode"
              />
            </div>
          </v-col>
        </v-row>
      </div>
    </div>
    <node-details :openDetails="openeDetails" :node="selectedNode" @close-details="openeDetails = false" />
  </view-layout>
</template>

<script lang="ts">
import { type GridNode, type NodesQuery, NodeStatus } from "@threefold/gridproxy_client";
import { ref, watch } from "vue";
import { onMounted } from "vue";

import toFixedCsSize from "../../utils/to_fixed_cs_size";
import toReadableDate from "../../utils/to_readable_data";
import NodeFilter from "../components/common/filters/node_filter.vue";
import NodeDetails from "../components/nodes/node_details.vue";
import NodeTable from "../components/nodes/nodes_table.vue";
import { getFilterValues, inputsInitializer, requestNodes } from "../utils/helpers";
import { type FilterInputs, type FilterOptions, type MixedFilter, optionsInitializer } from "../utils/types.js";

export default {
  components: {
    NodeFilter,
    NodeTable,
    NodeDetails,
  },
  setup() {
    const filterInputs = ref<FilterInputs>(inputsInitializer);
    const filterOptions = ref<FilterOptions>(optionsInitializer);
    const mixedFilters = ref<MixedFilter>({ inputs: filterInputs.value, options: filterOptions.value });

    const tableLoading = ref(false);
    const nodes = ref<GridNode[]>([]);
    const nodesCount = ref<number>(0);
    const selectedNode = ref<GridNode>();
    const openeDetails = ref<boolean>(false);

    const nodeStatusOptions = [NodeStatus.Up, NodeStatus.Down];

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

    watch(mixedFilters.value, async () => {
      const options = getFilterValues(mixedFilters.value);
      await _requestNodes(options, true);
    });

    watch(selectedNode, async () => {
      openeDetails.value = true;
    });

    // The mixed filters should reset to the default value again..
    const InputFiltersReset = (nFltrNptsVal: FilterInputs) => {
      mixedFilters.value.inputs = nFltrNptsVal;
      mixedFilters.value.options.status = NodeStatus.Up;
      mixedFilters.value.options.gpu = undefined;
      mixedFilters.value.options.gateway = undefined;
      mixedFilters.value.options.page = 1;
      mixedFilters.value.options.size = 10;
    };

    onMounted(async () => {
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
      openeDetails,

      requestNodes,
      toReadableDate,
      toFixedCsSize,
      InputFiltersReset,
    };
  },
};
</script>
