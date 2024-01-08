<template>
  <div class="hint">
    <v-alert type="info" variant="tonal">
      Node status is updated every 90 minutes. For a realtime status, click on the row.
    </v-alert>
  </div>

  <view-layout>
    <filters
      v-model:model-value="filterInputs"
      :options="filterOptions"
      :loading="loading"
      v-model:valid="isValidForm"
      @update:model-value="applyFilters"
      @reset="resetFilters"
    >
      <template #options>
        <v-col cols="12" sm="12" md="12" lg="2" class="ml-2">
          <v-select
            class="p-4"
            v-model="filterOptions.status"
            :items="nodeStatusOptions"
            label="Select Nodes Status"
            variant="outlined"
            :disabled="isFormLoading"
            open-on-clear
            clearable
          ></v-select>
        </v-col>
        <v-col cols="12" sm="12" md="6" lg="2" class="ml-8">
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
        <v-col cols="12" sm="12" md="6" lg="2">
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
      </template>
    </filters>

    <div class="nodes mt-5">
      <div class="nodes-inner">
        <v-row>
          <v-col cols="12">
            <div class="table">
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
      :filter-options="filterOptions"
      :nodeId="selectedNodeId"
      :openDialog="isDialogOpened"
      @close-dialog="closeDialog"
    />
  </view-layout>
</template>

<script lang="ts">
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { type GridNode, type NodesQuery, NodeStatus } from "@threefold/gridproxy_client";
import { capitalize, computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

import NodeDetails from "@/components/node_details.vue";
import NodesTable from "@/components/nodes_table.vue";
import router from "@/router";
import {
  type FilterInputs,
  type FilterOptions,
  type GridProxyRequestConfig,
  type MixedFilter,
  optionsInitializer,
} from "@/types";
import { inputsInitializer } from "@/utils/filter_nodes";
import { getQueries, requestNodes } from "@/utils/get_nodes";

export default {
  components: {
    NodesTable,
    NodeDetails,
  },
  setup() {
    const filterInputs = ref<FilterInputs>(inputsInitializer());
    const filterOptions = ref<FilterOptions>(optionsInitializer(undefined, undefined, undefined));
    const mixedFilters = computed<MixedFilter>(() => ({ inputs: filterInputs.value, options: filterOptions.value }));

    const loading = ref<boolean>(true);
    const isFormLoading = ref<boolean>(true);
    const nodes = ref<GridNode[]>([]);
    const nodesCount = ref<number>(0);
    const filtering = ref(false);
    const selectedNodeId = ref<number>(0);

    const isDialogOpened = ref<boolean>(false);
    const isValidForm = ref<boolean>(true);

    const nodeStatusOptions = [capitalize(NodeStatus.Up), capitalize(NodeStatus.Standby), capitalize(NodeStatus.Down)];
    const route = useRoute();

    const _requestNodes = async (queries: Partial<NodesQuery> = {}, config: GridProxyRequestConfig) => {
      if (isValidForm.value) {
        loading.value = true;
        isFormLoading.value = true;
        try {
          const { count, data } = await requestNodes(queries, config);
          nodes.value = data;
          nodesCount.value = count ?? 0;
        } catch (err) {
          console.log(err);
        } finally {
          loading.value = false;
          isFormLoading.value = false;
        }
      }
    };

    const applyFilters = async (filtersInputValues: FilterInputs) => {
      filtering.value = true;
      filterInputs.value = filtersInputValues;

      filterOptions.value = optionsInitializer(
        filterOptions.value.status,
        filterOptions.value.gpu,
        filterOptions.value.gateway,
      );

      if (isValidForm.value) {
        await updateNodes();
      }
      filtering.value = false;
    };
    const resetFilters = async (filtersInputValues: FilterInputs) => {
      filtering.value = true;
      filterInputs.value = filtersInputValues;

      filterOptions.value = optionsInitializer(undefined, undefined, undefined);

      if (isValidForm.value) {
        await updateNodes();
      }
      filtering.value = false;
    };

    const updateNodes = async () => {
      const queries = getQueries(mixedFilters.value);
      await _requestNodes(queries, { loadFarm: true });
    };

    watch(
      filterOptions,
      async () => {
        if (!filtering.value) {
          await updateNodes();
        }
      },
      { deep: true },
    );
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
      await _requestNodes(queries, { loadFarm: true });
    });

    return {
      loading,
      isFormLoading,
      nodes,
      nodesCount,
      selectedNodeId,
      nodeStatusOptions,
      filterInputs,
      filterOptions,
      isDialogOpened,
      isValidForm,
      updateNodes,
      openDialog,
      closeDialog,
      requestNodes,
      applyFilters,
      resetFilters,
    };
  },
};
</script>
