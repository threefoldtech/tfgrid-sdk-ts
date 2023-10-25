<template>
  <div class="hint">
    <v-alert type="info" variant="tonal">
      Node statuses are updated every 90 minutes. For a realtime status, please click on the row.
    </v-alert>
  </div>

  <view-layout>
    <node-filters
      :form-disabled="isFormLoading"
      v-model="filterInputs"
      v-model:valid="isValidForm"
      @update:model-value="inputFiltersReset"
    />
    <div class="nodes mt-5">
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
                            :disabled="isFormLoading"
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
                            :disabled="isFormLoading"
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
                          :disabled="isFormLoading"
                          open-on-clear
                          clearable
                        ></v-select>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </div>
              <div class="hint mb-2">
                <v-alert type="info" variant="tonal">
                  The nodes will be filtered and displayed after you enter the value by 1 second.
                </v-alert>
              </div>
              <nodes-table
                v-model="nodes"
                v-model:size="filterOptions.size"
                v-model:page="filterOptions.page"
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
    <node-details
      :options="selectedNodeoptions"
      :nodeId="selectedNodeId"
      :openDialog="isDialogOpened"
      @close-dialog="closeDialog"
    />
  </view-layout>
</template>

<script lang="ts">
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { type GridNode, type NodesQuery, NodeStatus } from "@threefold/gridproxy_client";
import debounce from "lodash/debounce.js";
import { capitalize, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

import NodeDetails from "@/explorer/components/node_details.vue";
import NodesTable from "@/explorer/components/nodes_table.vue";
import router from "@/router";
import { inputsInitializer } from "@/utils/filter_nodes";

import { getQueries, requestNodes } from "../utils/helpers";
import {
  type FilterInputs,
  type FilterOptions,
  type GridProxyRequestConfig,
  type MixedFilter,
  optionsInitializer,
} from "../utils/types";

export default {
  components: {
    NodesTable,
    NodeDetails,
  },
  setup() {
    const filterInputs = ref<FilterInputs>(inputsInitializer);
    const filterOptions = ref<FilterOptions>(optionsInitializer);
    const mixedFilters = ref<MixedFilter>({ inputs: filterInputs.value, options: filterOptions.value });

    const loading = ref<boolean>(true);
    const isFormLoading = ref<boolean>(true);
    const nodes = ref<GridNode[]>([]);
    const nodesCount = ref<number>(0);

    const selectedNodeId = ref<number>(0);
    const selectedNodeoptions = ref<GridProxyRequestConfig>({
      loadFarm: true,
      loadTwin: true,
      loadStats: true,
      loadGpu: true,
    });

    const isDialogOpened = ref<boolean>(false);
    const isValidForm = ref<boolean>(false);

    const nodeStatusOptions = [capitalize(NodeStatus.Up), capitalize(NodeStatus.Standby), capitalize(NodeStatus.Down)];
    const route = useRoute();

    const _requestNodes = async (queries: Partial<NodesQuery> = {}, config: GridProxyRequestConfig) => {
      if (isValidForm.value) {
        loading.value = true;
        isFormLoading.value = true;
        try {
          const { count, data } = await requestNodes(queries, config);
          nodes.value = data;
          if (count) {
            nodesCount.value = count;
          }
        } catch (err) {
          console.log(err);
        } finally {
          loading.value = false;
          isFormLoading.value = false;
        }
      }
    };

    const request = debounce(_requestNodes, 1000);

    watch(
      mixedFilters,
      async () => {
        const queries = getQueries(mixedFilters.value);
        await request(queries, { loadFarm: true });
      },
      { deep: true },
    );

    // The mixed filters should reset to the default value again..
    const inputFiltersReset = (nFltrNptsVal: FilterInputs) => {
      mixedFilters.value.inputs = nFltrNptsVal;
      mixedFilters.value.options.status = NodeStatus.Up;
      mixedFilters.value.options.gpu = undefined;
      mixedFilters.value.options.gateway = undefined;
      mixedFilters.value.options.page = 1;
      mixedFilters.value.options.size = 10;
    };

    const checkSelectedNode = async () => {
      if (route.query.nodeId) {
        selectedNodeId.value = +route.query.nodeId;
        isDialogOpened.value = true;
      }
    };

    const closeDialog = () => {
      if (route.query.nodeId) {
        router.replace(route.path);
      }
      isDialogOpened.value = false;
      selectedNodeId.value = 0;
    };

    const openDialog = async (item: { props: { title: GridNode } }) => {
      selectedNodeId.value = item.props.title.nodeId;
      isDialogOpened.value = true;
    };

    onMounted(async () => {
      await checkSelectedNode();
      const queries = getQueries(mixedFilters.value);
      await request(queries, { loadFarm: true });
    });

    return {
      loading,
      isFormLoading,

      nodes,
      nodesCount,

      selectedNodeId,
      selectedNodeoptions,
      nodeStatusOptions,

      filterInputs,
      filterOptions,
      isDialogOpened,
      isValidForm,

      openDialog,
      closeDialog,
      requestNodes,
      inputFiltersReset,
    };
  },
};
</script>
<style scoped>
.v-label {
  font-size: 0.875rem;
}
</style>
