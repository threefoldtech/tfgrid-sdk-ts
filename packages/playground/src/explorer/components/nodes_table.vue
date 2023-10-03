<template>
  <div class="table-content">
    <v-row>
      <v-col>
        <v-data-table-server
          :loading="loading"
          loading-text="Loading nodes..."
          :headers="headers"
          :items="modelValue"
          :items-length="count"
          :items-per-page="$props.size"
          :items-per-page-options="[
            { value: 5, title: '5' },
            { value: 10, title: '10' },
            { value: 15, title: '15' },
            { value: 50, title: '50' },
          ]"
          :page="$props.page"
          @update:page="$emit('update:page', $event)"
          @update:items-per-page="$emit('update:size', $event)"
          class="elevation-1 v-data-table-header"
          density="compact"
          :disable-sort="true"
          hide-default-header
          :hover="true"
          @click:row="openSheet"
        >
          <template #loading />

          <template v-slot:[`item.status`]="{ item }">
            <p class="text-left mt-1 mb-0">
              <v-chip :color="getNodeStatusColor(item.columns.status as string).color">
                <span>
                  {{ getNodeStatusColor(item.columns.status as string).status.toLocaleUpperCase() }}
                </span>
              </v-chip>
            </p>
          </template>
        </v-data-table-server>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { type GridNode, NodeStatus } from "@threefold/gridproxy_client";
import type { PropType } from "vue";
import type { VDataTable } from "vuetify/labs/VDataTable";

import { getNodeStatusColor } from "@/explorer/utils/helpers";
import formatResourceSize from "@/utils/format_resource_size";
import toReadableDate from "@/utils/to_readable_data";

export default {
  emits: ["update:page", "update:size", "open-dialog"],
  props: {
    size: {
      required: true,
      type: Number,
    },
    page: {
      required: true,
      type: Number,
    },
    modelValue: {
      required: true,
      type: [] as PropType<GridNode[]>,
    },
    selectedNode: {
      required: false,
      type: Object as PropType<GridNode>,
    },
    count: {
      required: true,
      type: Number,
    },
    loading: {
      required: true,
      type: Boolean,
    },
  },
  setup(_, { emit }) {
    const nodeStatusOptions = [NodeStatus.Up, NodeStatus.Down];

    const headers: VDataTable["headers"] = [
      { title: "ID", key: "nodeId", sortable: false },
      { title: "Farm ID", key: "farmId", align: "start", sortable: false },
      { title: "Total Public IPs", key: "publicIps.total", align: "start", sortable: false },
      { title: "Free Public IPs", key: "publicIps.free", align: "start", sortable: false },
      {
        title: "CRU",
        key: "total_resources.cru",
        align: "start",
        sortable: false,
      },
      {
        title: "MRU",
        key: "total_resources.mru",
        align: "start",
        value: item => formatResourceSize(item.total_resources.mru),
        sortable: false,
      },
      {
        title: "SRU",
        key: "total_resources.sru",
        align: "start",
        value: item => formatResourceSize(item.total_resources.sru),
        sortable: false,
      },
      {
        title: "HRU",
        key: "total_resources.hru",
        align: "start",
        value: item => formatResourceSize(item.total_resources.hru),
        sortable: false,
      },
      { title: "GPU", key: "num_gpu", align: "start", sortable: false },
      { title: "Up Time", key: "uptime", align: "start", sortable: false, value: item => toReadableDate(item.uptime) },
      { title: "Status", key: "status", align: "start", sortable: false },
    ];

    const openSheet = (_e: any, { item }: any) => {
      emit("open-dialog", item);
    };

    return {
      headers,
      nodeStatusOptions,
      getNodeStatusColor,
      openSheet,
    };
  },
};
</script>

<style>
.v-data-table-header th,
.v-data-table-header td {
  white-space: nowrap;
}
.v-data-table__tr {
  line-height: 55px;
}
.v-data-table__thead {
  line-height: 60px;
}
</style>
